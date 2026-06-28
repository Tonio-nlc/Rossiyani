import type { PatternEncounterState } from "@/types/reader-pattern-experience";
import type { LearningStateRecord } from "@/types/learning-state";

/**
 * Bridges legacy localStorage Pattern Encounters into Learning State aggregates.
 * Distinct text IDs are unknown from encounter store — caller may enrich separately.
 */
export function learningStateRecordFromEncounter(
  userId: string,
  patternId: string,
  encounter: PatternEncounterState | null,
  options?: {
    distinctTextIds?: string[];
    vocabularyVisitCount?: number;
    explanationDepthsSeen?: LearningStateRecord["explanationDepthsSeen"];
  },
): LearningStateRecord {
  if (!encounter) {
    return {
      userId,
      patternId,
      exposureCount: 0,
      distinctTextIds: options?.distinctTextIds ?? [],
      exploreCount: 0,
      noticeCount: 0,
      vocabularyVisitCount: options?.vocabularyVisitCount ?? 0,
      explanationDepthsSeen: options?.explanationDepthsSeen ?? [],
      retrievalAttempts: 0,
      retrievalSuccesses: 0,
      productionAttempts: 0,
      productionSuccesses: 0,
      connectedPatternIds: [],
      firstSeenAt: null,
      lastSeenAt: null,
      lastExploredAt: null,
      lastRetrievedAt: null,
      lastProducedAt: null,
    };
  }

  const lastSeenAt = encounter.lastTextId ? new Date() : null;

  return {
    userId,
    patternId,
    exposureCount: encounter.exposureCount,
    distinctTextIds: options?.distinctTextIds ?? (encounter.lastTextId ? [encounter.lastTextId] : []),
    exploreCount: encounter.exploreCount,
    noticeCount: Math.max(0, encounter.exploreCount - 1),
    vocabularyVisitCount: options?.vocabularyVisitCount ?? 0,
    explanationDepthsSeen: options?.explanationDepthsSeen ?? [],
    retrievalAttempts: 0,
    retrievalSuccesses: 0,
    productionAttempts: 0,
    productionSuccesses: 0,
    connectedPatternIds: [],
    firstSeenAt: lastSeenAt,
    lastSeenAt,
    lastExploredAt: encounter.exploreCount > 0 ? lastSeenAt : null,
    lastRetrievedAt: null,
    lastProducedAt: null,
  };
}
