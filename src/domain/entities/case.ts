import type { KnowledgeReviewStatus } from "@/types/domain";

/** Grammatical case node in the Knowledge Graph. */
export type CaseEntity = {
  id: string;
  caseKey: string;
  titleFr: string;
  canonicalExplanation: string | null;
  reviewStatus: KnowledgeReviewStatus;
  hitCount: number;
  conceptId: string | null;
};

export type CaseSummary = Pick<CaseEntity, "id" | "caseKey" | "titleFr" | "canonicalExplanation">;
