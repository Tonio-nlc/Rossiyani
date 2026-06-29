import type { ExplanationDepth } from "@/types/patterns";

export type ReaderPatternGuideCopy = {
  headlineWithAnchor: string;
  headlineDefault: string;
  noticeLead: string;
  comparePriorLabel: string;
  compareCurrentLabel: string;
  noticeInvitation: string;
  secondEncounter: string;
  exampleLabel: string;
};

export type ReaderPatternEncounterPhase =
  | "silent"
  | "first_explore"
  | "second_contact"
  | "insight";

export type ReaderPatternCanon = {
  id: string;
  userFacingName: string;
  observation: string;
  insight: string;
  comprehension: string;
  guide: ReaderPatternGuideCopy;
};

export type ReaderPatternInstanceSlice = {
  span: {
    startPosition: number;
    endPosition: number;
  };
  triggeringTokens: number[];
  salience: number;
  confidence: number;
};

export type ReaderSentencePatternContext = {
  primaryPatternId: string | null;
  instance: ReaderPatternInstanceSlice | null;
  secondaryPatternIds: string[];
};

export type ReaderPatternSlice = {
  patterns: Record<string, ReaderPatternCanon>;
  bySentenceId: Record<string, ReaderSentencePatternContext>;
};

export type ReaderPatternCardSection = {
  depth: ExplanationDepth;
  label: string;
  content: string;
};

export type ReaderPatternExperienceView = {
  visible: boolean;
  phase: ReaderPatternEncounterPhase;
  patternId: string | null;
  title: string | null;
  reminder: string | null;
  sections: ReaderPatternCardSection[];
  anchorText: string | null;
  suppressLegacyGrammar: boolean;
  secondaryPatternCount: number;
};

export type PatternEncounterState = {
  exposureCount: number;
  exploreCount: number;
  lastTextId: string | null;
  lastTextTitle: string | null;
  lastSentenceId: string | null;
};

export type BuildReaderPatternExperienceInput = {
  pattern: ReaderPatternCanon | null;
  instance: ReaderPatternInstanceSlice | null;
  secondaryPatternCount: number;
  wordPosition: number | null;
  interaction: "reading" | "explore_word" | "explore_sentence" | "explore_vocabulary";
  encounter: PatternEncounterState | null;
  anchorText?: string | null;
};
