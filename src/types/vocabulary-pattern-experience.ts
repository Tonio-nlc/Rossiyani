import type { ReaderPatternCanon } from "@/types/reader-pattern-experience";

export type VocabularyPatternEncounterExample = {
  id: string;
  russian: string;
  translation: string | null;
  textId: string | null;
  textTitle: string | null;
  textHref: string | null;
  sentenceId: string;
  audioCacheKey: string;
};

export type VocabularyPatternRef = ReaderPatternCanon & {
  pedagogicalObjective: string;
  formalization: string | null;
  isPrimary: boolean;
  encounteredExamples: VocabularyPatternEncounterExample[];
  relatedPatternIds: string[];
};

export type VocabularyPatternSlice = {
  primaryPatternId: string | null;
  whyItMatters: string;
  whatToNotice: string | null;
  patterns: VocabularyPatternRef[];
};
