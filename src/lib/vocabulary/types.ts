export type VocabularyWord = {
  id: string;
  russian: string;
  lemma: string | null;
  textId: string;
  savedAt: string;
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
};

export type VocabularySentence = {
  id: string;
  russian: string;
  translation: string;
  sourceTextId: string;
  sourceTextTitle: string;
  collection: string;
  savedAt: string;
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
