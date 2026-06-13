import type { KnowledgeConceptCategory, KnowledgeReviewStatus } from "@/types/domain";

/** Pedagogical concept — independent of any single word or sentence. */
export type ConceptEntity = {
  id: string;
  conceptKey: string;
  title: string;
  canonicalExplanation: string;
  category: KnowledgeConceptCategory;
  frenchComparison: string | null;
  commonMistakes: string[] | null;
  reviewStatus: KnowledgeReviewStatus;
  hitCount: number;
};

export type ConceptSummary = Pick<
  ConceptEntity,
  "id" | "conceptKey" | "title" | "canonicalExplanation" | "category"
>;
