import type { KnowledgeReviewStatus, PartOfSpeech, WordFrequency, FrequencyTier } from "@/types/domain";

/** Inflected surface form linked to a Lemma. */
export type WordFormEntity = {
  id: string;
  lemmaId: string;
  original: string;
  stressMarked: string;
  stem: string;
  ending: string;
  partOfSpeech: PartOfSpeech;
  case: string | null;
  gender: string | null;
  number: string | null;
  tense: string | null;
  aspect: string | null;
  explanation: string;
  canonicalExplanation: string | null;
  hitCount: number;
  occurrenceCount: number;
  reviewStatus: KnowledgeReviewStatus;
  frequency: WordFrequency | null;
  frequencyTier: FrequencyTier | null;
};

export type WordFormSummary = Pick<
  WordFormEntity,
  "id" | "original" | "lemmaId" | "ending" | "case" | "explanation" | "canonicalExplanation"
>;
