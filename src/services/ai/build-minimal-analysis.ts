import type { AnalysisStatus } from "./analysis-status";
import type { SentenceAnalysisOutput } from "./schemas";

const PLACEHOLDER_LITERAL = "Traduction mot à mot indisponible pour ce segment.";
const PLACEHOLDER_NATURAL = "Traduction naturelle indisponible pour ce segment.";
const PLACEHOLDER_LOGIC = "Analyse détaillée en attente.";
const PLACEHOLDER_ORDER = "Ordre des mots : analyse en attente.";
const PLACEHOLDER_USAGE = "Usage : analyse en attente.";

export type MinimalAnalysisOptions = {
  russianText: string;
  status: AnalysisStatus;
  reason?: string;
  partial?: Partial<
    Pick<
      SentenceAnalysisOutput,
      | "literalTranslation"
      | "naturalTranslation"
      | "russianLogic"
      | "orderExplanation"
      | "nativeUsageNotes"
      | "register"
      | "difficultyScore"
    >
  >;
};

/**
 * Builds a schema-valid sentence analysis when AI output is missing or unusable.
 * Guarantees the import pipeline can persist the segment.
 */
export function buildMinimalAnalysis(options: MinimalAnalysisOptions): SentenceAnalysisOutput {
  const { russianText, status, reason, partial } = options;

  return {
    russianText: russianText.trim(),
    literalTranslation: partial?.literalTranslation?.trim() || PLACEHOLDER_LITERAL,
    naturalTranslation: partial?.naturalTranslation?.trim() || PLACEHOLDER_NATURAL,
    russianLogic: partial?.russianLogic?.trim() || PLACEHOLDER_LOGIC,
    orderExplanation: partial?.orderExplanation?.trim() || PLACEHOLDER_ORDER,
    nativeUsageNotes: partial?.nativeUsageNotes?.trim() || PLACEHOLDER_USAGE,
    register: partial?.register ?? "neutral",
    difficultyScore: partial?.difficultyScore ?? 3,
    words: [],
    phraseGroups: [],
    culturalNotes: [],
    needsReview: true,
    reviewMessage:
      reason ??
      (status === "failed"
        ? "Analyse IA indisponible — segment enregistré sans détail mot à mot."
        : "Analyse mot à mot incomplète — révision ou regénération possible."),
    analysisStatus: status,
  };
}
