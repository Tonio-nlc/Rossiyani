import type { LearningPatternState } from "@/types/learning-state";
import type { PatternEncounterState } from "@/types/reader-pattern-experience";

import { ORCHESTRATOR_LIMITS } from "@/types/learning-orchestrator";

/**
 * Future orchestrator bridge — maps Learning State dimensions to encounter-like signals
 * without duplicating business rules in React or localStorage.
 */
export function toOrchestratorEncounterSignals(
  state: LearningPatternState,
): PatternEncounterState & {
  isInsightReady: boolean;
  isSecondContact: boolean;
  familiarityScore: number;
} {
  const { evidence, dimensions } = state;

  const encounter: PatternEncounterState = {
    exposureCount: evidence.exposureCount,
    exploreCount: evidence.exploreCount,
    lastTextId: null,
    lastTextTitle: null,
    lastSentenceId: null,
  };

  const familiarityScore = Math.round(
    evidence.exposureCount + evidence.exploreCount * 2 + dimensions.reuse * 4,
  );

  const isInsightReady =
    evidence.exploreCount >= 2 ||
    (evidence.exposureCount >= 3 && evidence.exploreCount >= 1) ||
    dimensions.comprehension >= 0.72;

  const isSecondContact =
    evidence.exposureCount >= ORCHESTRATOR_LIMITS.echoMinExposureCount &&
    evidence.exploreCount >= 1 &&
    !isInsightReady;

  return {
    ...encounter,
    isInsightReady,
    isSecondContact,
    familiarityScore,
  };
}

export function maxDepthFromLearningState(state: LearningPatternState): string | null {
  return state.maxDepthAllowed;
}
