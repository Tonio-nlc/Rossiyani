export type VocabularyBadgeTone = "blue" | "green" | "violet" | "gold" | "slate" | "rose" | "teal";

export type VocabularyBadge = {
  id: string;
  label: string;
  tone: VocabularyBadgeTone;
};

/** Saved word from Reader — enriched fields optional until API hydration. */
export type VocabularyWord = {
  id: string;
  russian: string;
  /** Forme dictionnaire (affichée comme « Mot ») */
  headword: string | null;
  textId: string;
  savedAt: string;
  detailHref: string;
  translation: string | null;
  partOfSpeech: string | null;
  cefrLevel: string | null;
  stressMarked: string | null;
  lastSeenAt: string | null;
  textCount: number;
  exampleRussian: string | null;
  exampleTranslation: string | null;
  badges: VocabularyBadge[];
  sourceTextHref: string;
};

export type VocabularyExpression = {
  id: string;
  russian: string;
  translation: string;
  meaning: string;
  exampleRussian: string;
  exampleTranslation: string;
  level: string;
  savedAt: string;
  source: "discovery";
  detailHref: string;
  badges: VocabularyBadge[];
};

export type VocabularySentence = {
  id: string;
  russian: string;
  translation: string;
  sourceTextId: string;
  sourceTextTitle: string;
  collection: string;
  savedAt: string;
  detailHref: string;
  practiceHref: string;
  badges: VocabularyBadge[];
};

export type VocabularyStats = {
  words: number;
  expressions: number;
  sentences: number;
};

export type VocabularyData = {
  words: VocabularyWord[];
  expressions: VocabularyExpression[];
  sentences: VocabularySentence[];
  stats: VocabularyStats;
};

export type VocabularyWordEnrichment = {
  id: string;
  translation: string | null;
  partOfSpeech: string | null;
  cefrLevel: string | null;
  stressMarked: string | null;
  textCount: number;
  exampleRussian: string | null;
  exampleTranslation: string | null;
  badges: VocabularyBadge[];
};
