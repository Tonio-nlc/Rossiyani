import type { DifficultyScore, Register } from "@/types/domain";

import type { CulturalNote } from "../pipeline/cultural-note";
import type { SyntaxAnalysis } from "../pipeline/syntax-analysis";

/** Sentence instance within a Text — all pedagogical data precomputed at import. */
export type SentenceEntity = {
  id: string;
  textId: string;
  position: number;
  russianText: string;
  literalTranslation: string;
  naturalTranslation: string;
  russianLogic: string;
  orderExplanation: string;
  nativeUsageNotes: string;
  register: Register;
  difficultyScore: DifficultyScore;
  needsReview: boolean;
  reviewMessage: string | null;
  syntaxAnalysis: SyntaxAnalysis | null;
  culturalNotes: CulturalNote[];
};

export type SentenceSummary = Pick<
  SentenceEntity,
  "id" | "textId" | "position" | "russianText" | "naturalTranslation" | "difficultyScore"
>;
