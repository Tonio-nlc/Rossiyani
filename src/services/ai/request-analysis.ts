import {
  auditPipelineStep,
  auditPreviewText,
  getCurrentSentenceIndex,
} from "@/lib/diagnostics/import-pipeline-audit";
import { logImportPhase } from "@/lib/diagnostics";

import type { AnalysisStatus } from "./analysis-status";
import { hasUsableTranslations } from "./analysis-status";
import { buildMinimalAnalysis } from "./build-minimal-analysis";
import {
  parseAnalysisResponseDetailed,
  type ParseAnalysisContext,
} from "./parse-analysis-response";
import {
  buildSentenceAnalysisSystemPrompt,
  buildSentenceAnalysisUserPrompt,
  buildStrictRetrySystemPrompt,
} from "./prompts/sentence-analysis-prompt";
import type { SentenceAnalysisInput, SentenceAnalysisOutput } from "./schemas";
import { sentenceAnalysisInputSchema } from "./schemas";

export type AnalysisRequestConfig = {
  apiKey: string;
  model: string;
  providerLabel?: string;
  parseContext?: ParseAnalysisContext;
  callModel: (params: {
    apiKey: string;
    model: string;
    system: string;
    user: string;
  }) => Promise<string>;
};

export type AnalysisRequestResult = {
  analysis: SentenceAnalysisOutput;
  status: AnalysisStatus;
  retryCount: number;
  reason?: string;
};

const MAX_RETRIES = 2;

/**
 * Shared analysis flow with automatic retries when words[] is empty.
 * Always returns a persistable analysis — never throws for empty AI output.
 */
export async function requestSentenceAnalysis(
  input: SentenceAnalysisInput,
  config: AnalysisRequestConfig,
): Promise<SentenceAnalysisOutput> {
  const result = await requestSentenceAnalysisWithRetry(input, config);
  return result.analysis;
}

export async function requestSentenceAnalysisWithRetry(
  input: SentenceAnalysisInput,
  config: AnalysisRequestConfig,
): Promise<AnalysisRequestResult> {
  const validated = sentenceAnalysisInputSchema.parse(input);
  const sentenceIndex = config.parseContext?.sentenceIndex ?? getCurrentSentenceIndex();
  let lastReason: string | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const system =
      attempt === 0
        ? buildSentenceAnalysisSystemPrompt()
        : buildStrictRetrySystemPrompt(attempt as 1 | 2);

    const user =
      attempt === 0
        ? buildSentenceAnalysisUserPrompt(validated)
        : `${buildSentenceAnalysisUserPrompt(validated)}\n\nIMPORTANT: la réponse précédente avait words=[] ou était incomplète. Inclure TOUS les tokens linguistiques dans words.`;

    logImportPhase("AI request start", {
      provider: config.providerLabel,
      model: config.model,
      russianText: validated.russianText,
      attempt,
      retry: attempt > 0,
    });

    let raw: string;
    try {
      raw = await auditPipelineStep(
        "aiRequest",
        "request-analysis.ts:request",
        {
          sentenceIndex,
          provider: config.providerLabel,
          model: config.model,
          attempt,
          russianTextLength: validated.russianText.length,
          preview: auditPreviewText(validated.russianText),
        },
        () =>
          config.callModel({
            apiKey: config.apiKey,
            model: config.model,
            system,
            user,
          }),
        (response) => ({
          responseSize: response.length,
          responseValid: response.includes("{"),
          preview: auditPreviewText(response, 160),
          attempt,
        }),
      );
    } catch (error) {
      lastReason = error instanceof Error ? error.message : "Appel IA impossible";
      logImportPhase("AI request failed", { attempt, reason: lastReason });
      if (attempt < MAX_RETRIES) {
        continue;
      }
      break;
    }

    const parsed = await auditPipelineStep(
      "parseAnalysisResponse",
      "request-analysis.ts:parse",
      {
        sentenceIndex,
        responseSize: raw.length,
        provider: config.providerLabel,
        attempt,
      },
      () =>
        Promise.resolve(
          parseAnalysisResponseDetailed(raw, {
            provider: config.providerLabel,
            ...config.parseContext,
            sentenceIndex,
            russianText: validated.russianText,
          }),
        ),
      (result) => ({
        zod: "success",
        wordCount: result.analysis.words.length,
        phraseGroupCount: result.analysis.phraseGroups.length,
        analysisStatus: result.status,
        preview: auditPreviewText(result.analysis.russianText, 80),
        attempt,
      }),
    );

    const needsRetry =
      parsed.analysis.words.length === 0 &&
      parsed.analysis.phraseGroups.length === 0 &&
      !hasUsableTranslations(parsed.analysis) &&
      attempt < MAX_RETRIES;

    if (!needsRetry) {
      logImportPhase("chunk analysis result", {
        sentenceIndex,
        status: parsed.status,
        reason: parsed.analysis.words.length === 0 ? "words_empty" : undefined,
        retry_count: attempt,
        saved: true,
        wordCount: parsed.analysis.words.length,
      });
      return {
        analysis: parsed.analysis,
        status: parsed.status,
        retryCount: attempt,
        reason: parsed.analysis.words.length === 0 ? "words_empty" : undefined,
      };
    }

    lastReason = "words_empty";
    logImportPhase("chunk retry scheduled", {
      sentenceIndex,
      attempt,
      reason: "words_empty",
    });
  }

  const analysis = buildMinimalAnalysis({
    russianText: validated.russianText,
    status: "partial",
    reason:
      lastReason === "words_empty"
        ? "Analyse mot à mot indisponible après plusieurs tentatives."
        : lastReason ?? "Appel IA impossible.",
  });

  logImportPhase("chunk analysis result", {
    sentenceIndex,
    status: "partial",
    reason: lastReason ?? "ai_unavailable",
    retry_count: MAX_RETRIES,
    saved: true,
    wordCount: 0,
  });

  return {
    analysis,
    status: lastReason === "words_empty" ? "partial" : "failed",
    retryCount: MAX_RETRIES,
    reason: lastReason,
  };
}
