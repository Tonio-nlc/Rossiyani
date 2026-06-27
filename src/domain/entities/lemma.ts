import type {
  FrequencyTier,
  KnowledgeReviewStatus,
  LexicalType,
  PartOfSpeech,
  WordFrequency,
} from "@/types/domain";

/** Canonical lemma — dictionary headword in the Knowledge Graph. */
export type LemmaEntity = {
  id: string;
  lemma: string;
  partOfSpeech: PartOfSpeech;
  isProperNoun: boolean | null;
  lexicalType: LexicalType | null;
  stressMarked: string;
  frequency: WordFrequency | null;
  frequencyTier: FrequencyTier | null;
  occurrenceCount: number;
  canonicalExplanation: string | null;
  frenchComparison: string | null;
  reviewStatus: KnowledgeReviewStatus;
};

export type LemmaSummary = Pick<
  LemmaEntity,
  "id" | "lemma" | "partOfSpeech" | "occurrenceCount" | "canonicalExplanation"
>;
