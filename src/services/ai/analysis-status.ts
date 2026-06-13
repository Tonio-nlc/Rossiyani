import type { SentenceAnalysisOutput } from "./schemas";

/** Sentence-level analysis completeness (import pipeline). */
export type AnalysisStatus = "complete" | "partial" | "failed";

export type ChunkAnalysisMeta = {
  status: AnalysisStatus;
  reason?: string;
  retryCount: number;
  saved: boolean;
  wordCount: number;
  phraseGroupCount: number;
};

export function resolveAnalysisStatus(params: {
  wordsLength: number;
  partialWordCount: number;
  skippedWordCount: number;
  hasSalvagedShell: boolean;
  isFallback: boolean;
}): AnalysisStatus {
  if (params.isFallback && params.wordsLength === 0) {
    return "failed";
  }
  if (params.wordsLength === 0) {
    return params.hasSalvagedShell ? "partial" : "partial";
  }
  if (params.partialWordCount > 0 || params.skippedWordCount > 0) {
    return "partial";
  }
  return "complete";
}

export function attachAnalysisStatus(
  analysis: SentenceAnalysisOutput,
  status: AnalysisStatus,
): SentenceAnalysisOutput {
  return { ...analysis, analysisStatus: status };
}

export function hasUsableTranslations(analysis: SentenceAnalysisOutput): boolean {
  const placeholders = [
    "Traduction mot à mot indisponible",
    "Traduction naturelle indisponible",
    "Analyse détaillée en attente",
  ];
  const natural = analysis.naturalTranslation?.trim() ?? "";
  if (!natural) {
    return false;
  }
  return !placeholders.some((p) => natural.startsWith(p));
}
