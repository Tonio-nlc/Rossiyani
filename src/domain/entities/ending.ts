import type { KnowledgeReviewStatus, PartOfSpeech } from "@/types/domain";

/** Reusable ending pedagogical card — linked to a Case. */
export type EndingEntity = {
  id: string;
  ending: string;
  caseKey: string;
  caseId: string | null;
  partOfSpeech: PartOfSpeech | null;
  explanationFr: string;
  canonicalExplanation: string | null;
  hitCount: number;
  reviewStatus: KnowledgeReviewStatus;
};

export type EndingSummary = Pick<
  EndingEntity,
  "id" | "ending" | "caseKey" | "explanationFr" | "canonicalExplanation"
>;
