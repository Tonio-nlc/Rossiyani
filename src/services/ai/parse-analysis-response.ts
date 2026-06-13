import {
  logImportError,
  logImportPhase,
  logParsedJsonBeforeZod,
  logProviderRawResponse,
} from "@/lib/diagnostics";

import type { AnalysisStatus } from "./analysis-status";
import { buildMinimalAnalysis } from "./build-minimal-analysis";
import { normalizeAnalysisPayload } from "./normalize-analysis-payload";
import { parseSentenceAnalysisTolerant } from "./tolerant-sentence-analysis";
import type { SentenceAnalysisOutput } from "./schemas";

export type ParseAnalysisContext = {
  provider?: string;
  sentenceIndex?: number;
  russianText?: string;
};

export type ParseAnalysisResult = {
  analysis: SentenceAnalysisOutput;
  status: AnalysisStatus;
  warnings: string[];
  isFallback: boolean;
};

/**
 * Extracts and validates JSON from an LLM response body.
 * Never fails the import for empty words[] — returns PARTIAL or FAILED with minimal structure.
 */
export function parseAnalysisResponse(
  raw: string,
  context?: ParseAnalysisContext,
): SentenceAnalysisOutput {
  return parseAnalysisResponseDetailed(raw, context).analysis;
}

export function parseAnalysisResponseDetailed(
  raw: string,
  context?: ParseAnalysisContext,
): ParseAnalysisResult {
  const logContext = {
    provider: context?.provider,
    sentenceIndex: context?.sentenceIndex,
    russianText: context?.russianText,
  };

  logProviderRawResponse(context?.provider ?? "AI", raw, logContext);

  try {
    const trimmed = raw.trim();
    const jsonText = extractJson(trimmed);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      logImportError("JSON.parse (analysis response)", parseError, {
        ...logContext,
        jsonTextPreview: jsonText.slice(0, 500),
      });
      if (context?.russianText) {
        logImportPhase("parseAnalysisResponse: JSON invalid — fallback", logContext);
        const analysis = buildMinimalAnalysis({
          russianText: context.russianText,
          status: "failed",
          reason: "Réponse IA : JSON illisible.",
        });
        return { analysis, status: "failed", warnings: ["JSON.parse failed"], isFallback: true };
      }
      throw parseError;
    }

    const normalized = normalizeAnalysisPayload(parsed);
    logParsedJsonBeforeZod(normalized, { ...logContext, stage: "after normalize" });

    const { analysis, partialWordCount, skippedWordCount, warnings, isFallback } =
      parseSentenceAnalysisTolerant(normalized, {
        fallbackRussianText: context?.russianText,
      });

    if (partialWordCount > 0 || skippedWordCount > 0 || analysis.words.length === 0) {
      logImportPhase("parseAnalysisResponse tolerant summary", {
        ...logContext,
        partialWordCount,
        skippedWordCount,
        validWordCount: analysis.words.length,
        analysisStatus: analysis.analysisStatus,
        warnings: warnings.slice(0, 10),
        isFallback,
      });
    }

    return {
      analysis,
      status: analysis.analysisStatus ?? "complete",
      warnings,
      isFallback,
    };
  } catch (error) {
    logImportError("parseAnalysisResponse", error, logContext);
    if (context?.russianText) {
      const analysis = buildMinimalAnalysis({
        russianText: context.russianText,
        status: "failed",
        reason: error instanceof Error ? error.message : "Erreur de parsing.",
      });
      return {
        analysis,
        status: "failed",
        warnings: ["parseAnalysisResponse exception"],
        isFallback: true,
      };
    }
    throw error;
  }
}

function extractJson(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }
  return text;
}
