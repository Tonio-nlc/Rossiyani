import type { PatternEncounterState } from "@/types/reader-pattern-experience";

import { ORCHESTRATOR_LIMITS } from "@/types/learning-orchestrator";

export function isInsightReady(encounter: PatternEncounterState | null): boolean {
  if (!encounter) {
    return false;
  }
  return (
    encounter.exploreCount >= 2 ||
    (encounter.exposureCount >= 3 && encounter.exploreCount >= 1)
  );
}

export function isSecondContact(encounter: PatternEncounterState | null): boolean {
  if (!encounter) {
    return false;
  }
  return (
    encounter.exposureCount >= ORCHESTRATOR_LIMITS.echoMinExposureCount &&
    encounter.exploreCount >= 1 &&
    !isInsightReady(encounter)
  );
}

export function isFirstExploration(encounter: PatternEncounterState | null): boolean {
  return (encounter?.exploreCount ?? 0) === 0;
}

export function shouldShowPatternEcho(encounter: PatternEncounterState | null): boolean {
  return (encounter?.exposureCount ?? 0) >= ORCHESTRATOR_LIMITS.echoMinExposureCount;
}

export function isTokenInPatternInstance(
  wordPosition: number,
  instance: { triggeringTokens: number[]; span: { startPosition: number; endPosition: number } },
): boolean {
  if (instance.triggeringTokens.includes(wordPosition)) {
    return true;
  }
  return (
    wordPosition >= instance.span.startPosition && wordPosition <= instance.span.endPosition
  );
}

export function familiarityScore(encounter: PatternEncounterState | null): number {
  if (!encounter) {
    return 0;
  }
  return encounter.exposureCount + encounter.exploreCount * 2;
}
