export type ContextTranslationRegister =
  | "neutral"
  | "informal"
  | "spoken"
  | "literary"
  | "formal";

export type ContextTranslationSourceLanguage = "fr" | "en" | "ru" | "other";

export type ThinkLikeNative = {
  sourceLanguageLabel: string;
  sourceThought: string;
  mentalImage: string;
  nativeThought: string;
  nativeFormulation: string;
  conceptualShift: string;
};

export type NaturalnessScore = {
  score: number;
  explanation: string;
  preferredExpression: string | null;
};

export type ContextTranslationCorrection = {
  userText: string;
  problem: string;
  nativeInterpretation: string;
  correction: string;
  reason: string;
};

export type ContextTranslationAlternative = {
  register: ContextTranslationRegister;
  text: string;
  frequency: string;
  nuance: string;
  whenToUse: string;
};

export type ContextTranslationGrammarConcept = {
  label: string;
  href: string | null;
  exampleCount: number | null;
  countLabel: string | null;
};

export type ContextTranslationVocabularyItem = {
  word: string;
  meaning: string;
};

export type ContextTranslationAnalysis = {
  sourceLanguage: ContextTranslationSourceLanguage;
  sourceText: string;
  bestTranslation: string;
  literalMeaning: string;
  thinkLikeNative: ThinkLikeNative;
  naturalness: NaturalnessScore | null;
  corrections: ContextTranslationCorrection[];
  alternatives: ContextTranslationAlternative[];
  culturalNotes: string[];
  grammarConcepts: ContextTranslationGrammarConcept[];
  vocabulary: ContextTranslationVocabularyItem[];
  saveableLesson: ContextTranslationSaveableLesson;
};

export type ContextTranslationSaveableLesson = {
  originalSentence: string;
  bestTranslation: string;
  literalMeaning: string;
  thinkLikeNative: ThinkLikeNative;
  naturalness: NaturalnessScore | null;
  corrections: ContextTranslationCorrection[];
  alternatives: ContextTranslationAlternative[];
  grammarConcepts: ContextTranslationGrammarConcept[];
  culturalNotes: string[];
  vocabulary: ContextTranslationVocabularyItem[];
};

export type SavedContextTranslationLesson = ContextTranslationSaveableLesson & {
  id: string;
  savedAt: string;
  analysis: ContextTranslationAnalysis;
};

export type ContextTranslationProgressPhase =
  | "bestTranslation"
  | "thinkLikeNative"
  | "grammar"
  | "alternatives"
  | "culturalNotes"
  | "complete";

export type ContextTranslationStreamEvent =
  | { type: "phase"; phase: ContextTranslationProgressPhase }
  | { type: "core"; data: Pick<ContextTranslationAnalysis, "sourceLanguage" | "bestTranslation" | "thinkLikeNative" | "naturalness" | "literalMeaning"> }
  | { type: "enrichment"; data: Pick<ContextTranslationAnalysis, "corrections" | "alternatives" | "culturalNotes" | "grammarConcepts" | "vocabulary"> }
  | { type: "complete"; analysis: ContextTranslationAnalysis }
  | { type: "error"; message: string };

export type ContextTranslationFollowUpMessage = {
  role: "user" | "assistant";
  content: string;
};
