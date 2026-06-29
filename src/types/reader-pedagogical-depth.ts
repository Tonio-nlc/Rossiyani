/** Progressive depth chosen by the Learning Orchestrator — no copy, no visibility flag. */
export type ReaderPedagogicalDepth =
  | "none"
  | "notice"
  | "reminder"
  | "observe"
  | "insight"
  | "understand";

export type ReaderPatternDepthView = {
  depth: ReaderPedagogicalDepth;
  patternId: string | null;
  suppressLegacyGrammar: boolean;
  secondaryPatternCount: number;
};

export const READER_DEPTH_RANK: Record<ReaderPedagogicalDepth, number> = {
  none: 0,
  notice: 1,
  reminder: 2,
  observe: 3,
  insight: 4,
  understand: 5,
};

export function isDepthAtLeast(
  current: ReaderPedagogicalDepth,
  minimum: ReaderPedagogicalDepth,
): boolean {
  return READER_DEPTH_RANK[current] >= READER_DEPTH_RANK[minimum];
}
