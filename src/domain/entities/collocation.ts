import type { KnowledgeReviewStatus } from "@/types/domain";

/** Word co-occurrence pattern — KnowledgePhrase with type COLLOCATION. */
export type CollocationEntity = {
  id: string;
  label: string;
  explanation: string;
  canonicalExplanation: string | null;
  hitCount: number;
  occurrenceCount: number;
  reviewStatus: KnowledgeReviewStatus;
};

export type CollocationSummary = Pick<
  CollocationEntity,
  "id" | "label" | "explanation" | "canonicalExplanation" | "occurrenceCount"
>;
