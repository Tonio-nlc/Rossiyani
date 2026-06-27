import type { PartOfSpeech } from "@/types/domain";

export type VocabularyFicheRow = {
  label: string;
  value: string;
};

export type VocabularyFicheFormRow = {
  id: string;
  form: string;
  case: string | null;
  ending: string | null;
  gender: string | null;
  number: string | null;
  tense: string | null;
  aspect: string | null;
};

export type VocabularyFicheDefinition = {
  meaning: string;
  note: string | null;
};

export type VocabularyFicheExample = {
  id: string;
  russian: string;
  translation: string | null;
  textId: string | null;
  textTitle: string | null;
  textHref: string | null;
  audioCacheKey: string;
};

export type VocabularyFichePhrase = {
  id: string;
  label: string;
  type: string;
  typeLabel: string;
  occurrenceCount: number;
};

export type VocabularyFicheLink = {
  label: string;
  href: string;
  hint: string | null;
};

export type VocabularyFicheReview = {
  savedAt: string;
  lastSeenAt: string | null;
  sourceTextId: string;
  sourceTextHref: string;
  sourceTextTitle: string | null;
  textCount: number;
  occurrenceCount: number;
};

export type VocabularyWordFiche = {
  savedWordId: string;
  lookupLemma: string;
  canonicalLemma: string;
  partOfSpeech: PartOfSpeech;
  partOfSpeechLabel: string;
  headline: string;
  stressMarked: string | null;
  primaryTranslation: string | null;
  cefrLevel: string | null;
  frequencyLabel: string | null;
  frequencyStars: number | null;
  pronunciationNote: string | null;
  audioTarget: {
    scope: "word";
    entityId: string;
  } | {
    scope: "utterance";
    text: string;
    cacheKey: string;
  };
  understand: {
    definitions: VocabularyFicheDefinition[];
    nuances: string | null;
    frenchComparison: string | null;
    falseFriendWarning: string | null;
  };
  grammar: {
    title: string;
    rows: VocabularyFicheRow[];
    forms: VocabularyFicheFormRow[];
    note: string | null;
  } | null;
  examples: VocabularyFicheExample[];
  expressions: VocabularyFichePhrase[];
  family: VocabularyFicheLink[];
  linguisticLinks: {
    collocations: VocabularyFicheLink[];
    concepts: VocabularyFicheLink[];
    cases: VocabularyFicheLink[];
    relatedLemmas: VocabularyFicheLink[];
  };
  review: VocabularyFicheReview;
  readerHref: string | null;
  explorerHref: string | null;
  wordId: string | null;
};
