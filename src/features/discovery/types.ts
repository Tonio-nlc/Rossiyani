import type { CefrLevel, FeaturedCandidateType, PartOfSpeech, Register } from "@prisma/client";

export type LearningSignals = {
  exploredLemmas: string[];
  exploredConcepts: string[];
  exploredPhrases: string[];
  readTextIds: string[];
  practiceStructures: string[];
  savedPhraseTexts: string[];
  recentTopics: string[];
  /** Daily discovery archive — candidate id + calendar date */
  discoveryArchive: Array<{ candidateId: string; dateKey: string }>;
  /** Most recently opened manual lesson slugs (most recent first). */
  recentManualLessonSlugs: string[];
  /** @deprecated Use discoveryArchive — kept for cookie backward compatibility */
  featuredHistory: string[];
};

export const EMPTY_LEARNING_SIGNALS: LearningSignals = {
  exploredLemmas: [],
  exploredConcepts: [],
  exploredPhrases: [],
  readTextIds: [],
  practiceStructures: [],
  savedPhraseTexts: [],
  recentTopics: [],
  discoveryArchive: [],
  recentManualLessonSlugs: [],
  featuredHistory: [],
};

export type TodaysDiscovery = {
  id: string;
  type: FeaturedCandidateType;
  typeLabel: string;
  displayLabel: string;
  subtitle: string;
  explanation: string;
  exampleRussian: string;
  exampleTranslation: string;
  difficulty: CefrLevel;
  register: Register;
  topics: string[];
  explorerHref: string;
  practiceHref: string;
  readExamplesHref: string;
  partOfSpeech: PartOfSpeech | null;
  dateKey: string;
};

export type FeaturedCandidateRow = {
  id: string;
  type: FeaturedCandidateType;
  lemma: string;
  frequency: number;
  register: Register;
  difficulty: CefrLevel;
  topics: unknown;
  relations: unknown;
  qualityScore: number;
  lastFeatured: Date | null;
  manualPriority: number;
  subtitle: string | null;
  explanation: string | null;
  exampleRussian: string | null;
  exampleTranslation: string | null;
  explorerHref: string | null;
  practiceHref: string | null;
  readExamplesHref: string | null;
  partOfSpeech: PartOfSpeech | null;
};

export const DISCOVERY_TYPE_LABELS: Record<FeaturedCandidateType, string> = {
  WORD: "Word",
  EXPRESSION: "Expression",
  CONSTRUCTION: "Construction",
  COLLOCATION: "Collocation",
  GRAMMAR: "Grammar pattern",
  SLANG: "Internet slang",
  CONVERSATION: "Conversation",
  REGIONAL: "Regional usage",
  NATIVE_PHRASE: "Native phrase",
};

export const DISCOVERY_TYPE_WEIGHTS: Array<{ type: FeaturedCandidateType; weight: number }> = [
  { type: "WORD", weight: 35 },
  { type: "EXPRESSION", weight: 25 },
  { type: "CONSTRUCTION", weight: 20 },
  { type: "COLLOCATION", weight: 10 },
  { type: "GRAMMAR", weight: 5 },
  { type: "SLANG", weight: 5 },
];

export const MIN_QUALITY_SCORE = 40;
