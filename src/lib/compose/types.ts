export type ComposeMode = import("./modes").ComposeMode;

export type ComposeTheme =
  | "daily_life"
  | "work"
  | "travel"
  | "literature"
  | "conversation"
  | "free";

export type ComposeRegister = "casual" | "neutral" | "formal";

export type ComposeVerdict = "natural" | "correct" | "unusual" | "needs_correction";

export type ComposeCorrection = {
  id: string;
  fragment: string;
  corrected: string;
  explanation: string;
  rule: string;
  contextNote: string;
};

export type ComposeOverview = {
  strengths: string[];
  improvements: string[];
};

export type ComposeVocabularyLink = {
  word: string;
  label: string;
  href: string | null;
  encountered: boolean;
  savedWordId: string | null;
};

export type ComposeLinguisticBlock = {
  id: string;
  category: string;
  note: string;
  explorerHref?: string;
};

export type ComposeAlternative = {
  register: string;
  text: string;
  nuance?: string;
};

export type ComposeStructure = {
  label: string;
  href: string;
};

export type ComposeAuthenticExample = {
  textTitle: string;
  href: string;
  excerpt: string;
};

export type ComposeRelatedExpression = {
  label: string;
  href: string;
  reason: string;
};

export type PracticeRewritePreset = {
  id: string;
  label: string;
  instruction: string;
  shortTitle: string;
};

export type ComposeAnalysis = {
  mode?: ComposeMode;
  verdict: ComposeVerdict;
  summary: string;
  correctedSentence?: string | null;
  overview?: ComposeOverview;
  corrections?: ComposeCorrection[];
  vocabularyLinks?: ComposeVocabularyLink[];
  linguisticBlocks: ComposeLinguisticBlock[];
  alternatives: ComposeAlternative[];
  structures: ComposeStructure[];
  authenticExamples: ComposeAuthenticExample[];
  relatedExpressions: ComposeRelatedExpression[];
  rewritePrompts: string[];
};

export type ComposeAnalyzeRequest = {
  mode?: ComposeMode;
  context?: string;
  russianText: string;
  frenchPrompt?: string;
  referenceRussian?: string;
  theme?: ComposeTheme;
  register?: ComposeRegister;
  knownWords?: Array<{
    word: string;
    lemma: string | null;
    savedWordId: string;
    textId: string;
  }>;
};

export type PostReadingExercise = {
  id: string;
  type: "translation" | "reformulation" | "structure";
  title: string;
  frenchPrompt?: string;
  referenceRussian?: string;
  hint?: string;
  textId: string;
  textTitle: string;
};

export type SavedComposePhrase = {
  id: string;
  originalSentence: string;
  context?: string;
  correctedVersion?: string;
  alternatives: ComposeAlternative[];
  structures: ComposeStructure[];
  analysis: ComposeAnalysis;
  savedAt: string;
};

export const COMPOSE_THEMES: Array<{ id: ComposeTheme; label: string }> = [
  { id: "daily_life", label: "Daily life" },
  { id: "work", label: "Work" },
  { id: "travel", label: "Travel" },
  { id: "literature", label: "Literature" },
  { id: "conversation", label: "Conversation" },
  { id: "free", label: "Free" },
];

export const COMPOSE_REGISTERS: Array<{ id: ComposeRegister; label: string }> = [
  { id: "casual", label: "Casual" },
  { id: "neutral", label: "Neutral" },
  { id: "formal", label: "Formal" },
];

export const COMPOSE_VERDICT_LABELS: Record<ComposeVerdict, string> = {
  natural: "Naturel",
  correct: "Correct",
  unusual: "Compréhensible, mais inhabituel",
  needs_correction: "À corriger",
};

export const PRACTICE_REWRITE_PRESETS: PracticeRewritePreset[] = [
  {
    id: "natural",
    label: "More natural →",
    shortTitle: "More natural",
    instruction: "Make it sound more natural for everyday speech.",
  },
  {
    id: "conversational",
    label: "More conversational →",
    shortTitle: "More conversational",
    instruction: "Make it more conversational and casual.",
  },
  {
    id: "literary",
    label: "More literary →",
    shortTitle: "More literary",
    instruction: "Make it more literary and refined.",
  },
  {
    id: "different",
    label: "Express the same idea differently →",
    shortTitle: "Same idea, different form",
    instruction: "Express the same idea differently using different syntax or construction.",
  },
];
