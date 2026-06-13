import type { KnowledgeReviewStatus, PhraseGroupType } from "@/types/domain";

const EXPRESSION_TYPES: PhraseGroupType[] = ["FIXED_EXPRESSION", "NATIVE_CONSTRUCTION"];

/** Fixed or idiomatic expression — subset of KnowledgePhrase. */
export type ExpressionEntity = {
  id: string;
  label: string;
  type: Extract<PhraseGroupType, "FIXED_EXPRESSION" | "NATIVE_CONSTRUCTION">;
  explanation: string;
  canonicalExplanation: string | null;
  hitCount: number;
  occurrenceCount: number;
  reviewStatus: KnowledgeReviewStatus;
};

export type ExpressionSummary = Pick<
  ExpressionEntity,
  "id" | "label" | "type" | "explanation" | "canonicalExplanation"
>;

export function isExpressionType(type: PhraseGroupType): type is ExpressionEntity["type"] {
  return EXPRESSION_TYPES.includes(type);
}
