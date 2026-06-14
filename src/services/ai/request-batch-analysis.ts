import {
  auditPipelineStep,
  auditPreviewText,
} from "@/lib/diagnostics/import-pipeline-audit";
import { logImportPhase } from "@/lib/diagnostics";

import type { AnalysisStatus } from "./analysis-status";
import { hasUsableTranslations } from "./analysis-status";
import { buildMinimalAnalysis } from "./build-minimal-analysis";
import { normalizeAnalysisPayload } from "./normalize-analysis-payload";
import type { ParseAnalysisContext } from "./parse-analysis-response";
import {
  buildBatchSentenceAnalysisSystemPrompt,
  buildBatchSentenceAnalysisUserPrompt,
  buildBatchStrictRetrySystemPrompt,
} from "./prompts/batch-sentence-analysis-prompt";
import type { SentenceAnalysisInput, SentenceAnalysisOutput } from "./schemas";
import { requestSentenceAnalysisWithRetry, type AnalysisRequestConfig } from "./request-analysis";
import { parseSentenceAnalysisTolerant } from "./tolerant-sentence-analysis";

export type BatchAnalysisRequestResult = {
  analyses: SentenceAnalysisOutput[];
  status: AnalysisStatus;
  retryCount: number;
};

const MAX_BATCH_RETRIES = 1;

function extractSentencesArray(parsed: unknown): unknown[] | null {
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const record = parsed as Record<string, unknown>;
  if (Array.isArray(record.sentences)) {
    return record.sentences;
  }
  if (Array.isArray(parsed)) {
    return parsed;
  }
  return null;
}

function parseBatchPayload(
  raw: string,
  inputs: SentenceAnalysisInput[],
): SentenceAnalysisOutput[] {
  const trimmed = raw.trim();
  const jsonStart = trimmed.indexOf("{");
  const arrayStart = trimmed.indexOf("[");
  const start =
    jsonStart >= 0 && (arrayStart < 0 || jsonStart < arrayStart) ? jsonStart : arrayStart;
  if (start < 0) {
    throw new Error("Batch response contains no JSON");
  }

  const parsed = JSON.parse(trimmed.slice(start)) as unknown;
  const sentences = extractSentencesArray(parsed);

  if (!sentences) {
    throw new Error('Batch response missing "sentences" array');
  }

  const results: SentenceAnalysisOutput[] = [];

  for (let index = 0; index < inputs.length; index += 1) {
    const input = inputs[index]!;
    const item = sentences[index];

    if (!item || typeof item !== "object") {
      results.push(
        buildMinimalAnalysis({
          russianText: input.russianText,
          status: "partial",
          reason: "Analyse manquante dans la réponse groupée.",
        }),
      );
      continue;
    }

    const normalized = normalizeAnalysisPayload(item);
    const { analysis } = parseSentenceAnalysisTolerant(normalized, {
      fallbackRussianText: input.russianText,
    });

    results.push(
      analysis.russianText.trim() === input.russianText.trim()
        ? analysis
        : { ...analysis, russianText: input.russianText },
    );
  }

  return results;
}

function batchNeedsRetry(
  analyses: SentenceAnalysisOutput[],
  inputs: SentenceAnalysisInput[],
): boolean {
  if (analyses.length !== inputs.length) {
    return true;
  }

  return analyses.some(
    (analysis) =>
      analysis.words.length === 0 &&
      analysis.phraseGroups.length === 0 &&
      !hasUsableTranslations(analysis),
  );
}

/**
 * Analyzes multiple sentences in a single AI request.
 */
export async function requestBatchSentenceAnalysis(
  inputs: SentenceAnalysisInput[],
  config: AnalysisRequestConfig,
): Promise<BatchAnalysisRequestResult> {
  if (inputs.length === 0) {
    return { analyses: [], status: "complete", retryCount: 0 };
  }

  if (inputs.length === 1) {
    const single = await requestSentenceAnalysisWithRetry(inputs[0]!, config);
    return {
      analyses: [single.analysis],
      status: single.status,
      retryCount: single.retryCount,
    };
  }

  let lastReason: string | undefined;
  let lastAnalyses: SentenceAnalysisOutput[] = [];

  for (let attempt = 0; attempt <= MAX_BATCH_RETRIES; attempt += 1) {
    const system =
      attempt === 0
        ? buildBatchSentenceAnalysisSystemPrompt()
        : buildBatchStrictRetrySystemPrompt();

    const user = buildBatchSentenceAnalysisUserPrompt(inputs);

    logImportPhase("AI batch request start", {
      provider: config.providerLabel,
      model: config.model,
      sentenceCount: inputs.length,
      attempt,
    });

    let raw: string;
    try {
      raw = await auditPipelineStep(
        "aiRequest",
        "request-batch-analysis.ts:request",
        {
          provider: config.providerLabel,
          model: config.model,
          attempt,
          sentenceCount: inputs.length,
          preview: auditPreviewText(inputs.map((item) => item.russianText).join(" | "), 120),
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
          preview: auditPreviewText(response, 160),
          attempt,
        }),
      );
    } catch (error) {
      lastReason = error instanceof Error ? error.message : "Appel IA groupé impossible";
      if (attempt < MAX_BATCH_RETRIES) {
        continue;
      }
      break;
    }

    try {
      lastAnalyses = parseBatchPayload(raw, inputs);

      if (!batchNeedsRetry(lastAnalyses, inputs) || attempt >= MAX_BATCH_RETRIES) {
        return {
          analyses: lastAnalyses,
          status: lastAnalyses.every((analysis) => analysis.words.length > 0)
            ? "complete"
            : "partial",
          retryCount: attempt,
        };
      }

      lastReason = "batch_incomplete";
    } catch (error) {
      lastReason = error instanceof Error ? error.message : "Parse batch JSON failed";
      if (attempt < MAX_BATCH_RETRIES) {
        continue;
      }
    }
  }

  if (lastAnalyses.length === inputs.length && lastAnalyses.length > 0) {
    const recovered = await recoverFailedBatchAnalyses(inputs, lastAnalyses, config);
    return {
      analyses: recovered,
      status: recovered.every((analysis) => analysis.words.length > 0) ? "complete" : "partial",
      retryCount: MAX_BATCH_RETRIES + 1,
    };
  }

  const analyses = inputs.map((input) =>
    buildMinimalAnalysis({
      russianText: input.russianText,
      status: "partial",
      reason: lastReason ?? "Analyse groupée indisponible.",
    }),
  );

  return {
    analyses,
    status: "partial",
    retryCount: MAX_BATCH_RETRIES,
  };
}

/** Recover incomplete batch entries with parallel single-sentence calls. */
export async function recoverFailedBatchAnalyses(
  inputs: SentenceAnalysisInput[],
  partialAnalyses: SentenceAnalysisOutput[],
  config: AnalysisRequestConfig,
): Promise<SentenceAnalysisOutput[]> {
  return Promise.all(
    inputs.map(async (input, index) => {
      const existing = partialAnalyses[index];
      if (
        existing &&
        (existing.words.length > 0 ||
          existing.phraseGroups.length > 0 ||
          hasUsableTranslations(existing))
      ) {
        return existing;
      }

      const recovered = await requestSentenceAnalysisWithRetry(input, {
        ...config,
        parseContext: {
          ...(config.parseContext ?? {}),
          russianText: input.russianText,
        } satisfies ParseAnalysisContext,
      });
      return recovered.analysis;
    }),
  );
}
