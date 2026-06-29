/** User-facing pedagogical panel — no engine jargon. */
export type ReaderWordGuideNotice = {
  priorForm: string | null;
  currentForm: string;
  bridge: string;
};

export type ReaderWordGuideView = {
  /** Full guide when a pattern moment is active; lookup for translation-only. */
  mode: "guide" | "lookup";
  headline: string | null;
  notice: ReaderWordGuideNotice | null;
  discovery: string | null;
  explanation: string | null;
  exampleLine: string | null;
  exampleAnchor: string | null;
  /** Word ids to subtly highlight in the sentence (comparison + anchor). */
  linkedWordIds: string[];
};
