/**
 * Domain types aligned with prisma/schema.prisma.
 */

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "Native";

export type Register = "neutral" | "informal" | "formal" | "literary" | "slang";

export type DifficultyScore = 1 | 2 | 3 | 4 | 5;

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "pronoun"
  | "adverb"
  | "numeral"
  | "preposition"
  | "conjunction"
  | "particle"
  | "interjection";

export type LexicalType =
  | "common_noun"
  | "proper_noun"
  | "verb"
  | "adjective"
  | "pronoun"
  | "numeral"
  | "particle"
  | "interjection"
  | "abbreviation"
  | "other";

export type WordFrequency = "VERY_COMMON" | "COMMON" | "UNCOMMON" | "RARE";

export type FrequencyTier = "TOP_500" | "TOP_1000" | "TOP_3000" | "BEYOND_TOP_3000";

export type PhraseGroupType = "COLLOCATION" | "FIXED_EXPRESSION" | "NATIVE_CONSTRUCTION";

export type KnowledgeConceptCategory =
  | "GRAMMATICAL_CASE"
  | "GRAMMAR_PATTERN"
  | "PREPOSITION_PATTERN"
  | "CONSTRUCTION"
  | "SEMANTIC"
  | "OTHER";

export type KnowledgeReviewStatus = "PENDING" | "CANONICAL" | "REJECTED";

export type Text = {
  id: string;
  title: string;
  level: CefrLevel;
  collectionId: string;
  categoryIds: string[];
  createdAt: Date;
};

export type Sentence = {
  id: string;
  textId: string;
  position: number;
  russianText: string;
  literalTranslation: string;
  naturalTranslation: string;
  russianLogic: string;
  orderExplanation: string;
  nativeUsageNotes: string;
  register: Register;
  difficultyScore: DifficultyScore;
  needsReview: boolean;
  reviewMessage?: string;
};

export type Word = {
  id: string;
  sentenceId: string;
  position: number;
  original: string;
  lemma: string;
  stressMarked: string;
  stem: string;
  ending: string;
  partOfSpeech: PartOfSpeech;
  isProperNoun?: boolean | null;
  lexicalType?: LexicalType | null;
  case?: string;
  gender?: string;
  number?: string;
  tense?: string;
  aspect?: string;
  explanation: string;
  frequency?: WordFrequency;
  frequencyTier?: FrequencyTier;
};

export type PhraseGroup = {
  id: string;
  sentenceId: string;
  type: PhraseGroupType;
  label: string;
  explanation: string;
  startPosition: number;
  endPosition: number;
};

export const DIFFICULTY_SCORE_LABELS: Record<DifficultyScore, string> = {
  1: "Très facile",
  2: "Facile",
  3: "Intermédiaire",
  4: "Difficile",
  5: "Avancé / natif",
};

export const REGISTER_LABELS: Record<Register, string> = {
  neutral: "Neutre",
  informal: "Informel",
  formal: "Formel",
  literary: "Littéraire",
  slang: "Argot",
};

export const WORD_FREQUENCY_LABELS: Record<WordFrequency, string> = {
  VERY_COMMON: "Très courant",
  COMMON: "Courant",
  UNCOMMON: "Peu courant",
  RARE: "Rare",
};

export const FREQUENCY_TIER_LABELS: Record<FrequencyTier, string> = {
  TOP_500: "Top 500",
  TOP_1000: "Top 1000",
  TOP_3000: "Top 3000",
  BEYOND_TOP_3000: "Au-delà du top 3000",
};

export const PHRASE_GROUP_TYPE_LABELS: Record<PhraseGroupType, string> = {
  COLLOCATION: "Collocation",
  FIXED_EXPRESSION: "Expression fixe",
  NATIVE_CONSTRUCTION: "Construction native",
};
