/** User-facing guide panel — display only; copy comes from Pattern Catalog. */
export type ReaderWordGuideView = {
  mode: "guide" | "lookup";
  depth: import("@/types/reader-pedagogical-depth").ReaderPedagogicalDepth;
  headline: string | null;
  copy: import("@/types/reader-pattern-experience").ReaderPatternGuideCopy | null;
  compare: {
    priorForm: string | null;
    currentForm: string;
  } | null;
  invitation: string | null;
  secondEncounter: string | null;
  observe: string | null;
  insight: string | null;
  understand: string | null;
  exampleLine: string | null;
  linkedWordIds: string[];
};
