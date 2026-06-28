import type {
  LearningPatternState,
  LearningStateInput,
  LearningStateRecord,
  PatternLearningEvent,
} from "@/types/learning-state";

import { buildEvidence, computeDimensions } from "./compute-dimensions";
import { deriveLifecycle, maxDepthForLifecycle } from "./derive-lifecycle";

export function computeLearningState(input: LearningStateInput): LearningPatternState {
  const asOf = input.asOf ?? new Date();
  const dimensions = computeDimensions(input);
  const evidence = buildEvidence(input, asOf);
  const lifecycle = deriveLifecycle(
    dimensions,
    {
      distinctTextCount: evidence.distinctTextCount,
      connectedPatternIds: evidence.connectedPatternIds,
      exposureCount: evidence.exposureCount,
    },
    input.masteryConditions,
  );

  return {
    userId: input.userId,
    patternId: input.patternId,
    dimensions,
    lifecycle,
    maxDepthAllowed: maxDepthForLifecycle(lifecycle),
    evidence,
    computedAt: asOf.toISOString(),
  };
}

function touchFirstSeen(record: LearningStateRecord, at: Date): LearningStateRecord {
  return {
    ...record,
    firstSeenAt: record.firstSeenAt ?? at,
  };
}

function addDistinctText(record: LearningStateRecord, textId: string): LearningStateRecord {
  if (record.distinctTextIds.includes(textId)) {
    return record;
  }
  return {
    ...record,
    distinctTextIds: [...record.distinctTextIds, textId],
  };
}

function addDepth(record: LearningStateRecord, depth: import("@/types/patterns").ExplanationDepth): LearningStateRecord {
  if (record.explanationDepthsSeen.includes(depth)) {
    return record;
  }
  return {
    ...record,
    explanationDepthsSeen: [...record.explanationDepthsSeen, depth],
  };
}

/**
 * Applies a pedagogical event to raw aggregates (before recomputing dimensions).
 */
export function applyLearningEvent(
  record: LearningStateRecord,
  event: PatternLearningEvent,
): LearningStateRecord {
  const at = event.at ?? new Date();
  let next = touchFirstSeen(record, at);

  switch (event.type) {
    case "exposure":
      next = addDistinctText(next, event.textId);
      return {
        ...next,
        exposureCount: next.exposureCount + 1,
        lastSeenAt: at,
      };

    case "notice":
      return {
        ...next,
        noticeCount: next.noticeCount + 1,
        lastSeenAt: at,
        vocabularyVisitCount:
          event.surface === "vocabulary" ? next.vocabularyVisitCount + 1 : next.vocabularyVisitCount,
      };

    case "explore":
      next = event.depth ? addDepth(next, event.depth) : next;
      return {
        ...next,
        exploreCount: next.exploreCount + 1,
        lastExploredAt: at,
        lastSeenAt: at,
        vocabularyVisitCount:
          event.surface === "vocabulary" ? next.vocabularyVisitCount + 1 : next.vocabularyVisitCount,
      };

    case "explain":
      return {
        ...addDepth(next, event.depth),
        lastExploredAt: at,
        lastSeenAt: at,
      };

    case "connect":
      if (next.connectedPatternIds.includes(event.relatedPatternId)) {
        return { ...next, lastSeenAt: at };
      }
      return {
        ...next,
        connectedPatternIds: [...next.connectedPatternIds, event.relatedPatternId],
        lastSeenAt: at,
      };

    case "retrieve":
      return {
        ...next,
        retrievalAttempts: next.retrievalAttempts + 1,
        retrievalSuccesses: next.retrievalSuccesses + (event.success ? 1 : 0),
        lastRetrievedAt: at,
        lastSeenAt: at,
      };

    case "produce":
      return {
        ...next,
        productionAttempts: next.productionAttempts + 1,
        productionSuccesses: next.productionSuccesses + (event.success ? 1 : 0),
        lastProducedAt: at,
        lastSeenAt: at,
      };

    default:
      return next;
  }
}

export function recordToInput(
  record: LearningStateRecord,
  options?: Pick<LearningStateInput, "introductionConditions" | "masteryConditions" | "asOf">,
): LearningStateInput {
  return {
    ...record,
    introductionConditions: options?.introductionConditions,
    masteryConditions: options?.masteryConditions,
    asOf: options?.asOf,
  };
}
