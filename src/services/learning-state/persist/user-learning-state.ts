import { prisma } from "@/lib/prisma";
import type { ExplanationDepth } from "@/types/patterns";
import type {
  LearningPatternState,
  LearningStateRecord,
  PatternLifecycleState,
} from "@/types/learning-state";

import { computeLearningState, recordToInput } from "../compute-learning-state";

function parseDepths(json: string): ExplanationDepth[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? (parsed as ExplanationDepth[]) : [];
  } catch {
    return [];
  }
}

function parseStringArray(json: string): string[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function rowToRecord(row: {
  userId: string;
  patternId: string;
  exposureCount: number;
  distinctTextIdsJson: string;
  exploreCount: number;
  noticeCount: number;
  vocabularyVisitCount: number;
  explanationDepthsJson: string;
  retrievalAttempts: number;
  retrievalSuccesses: number;
  productionAttempts: number;
  productionSuccesses: number;
  connectedPatternIdsJson: string;
  firstSeenAt: Date | null;
  lastSeenAt: Date | null;
  lastExploredAt: Date | null;
  lastRetrievedAt: Date | null;
  lastProducedAt: Date | null;
}): LearningStateRecord {
  return {
    userId: row.userId,
    patternId: row.patternId,
    exposureCount: row.exposureCount,
    distinctTextIds: parseStringArray(row.distinctTextIdsJson),
    exploreCount: row.exploreCount,
    noticeCount: row.noticeCount,
    vocabularyVisitCount: row.vocabularyVisitCount,
    explanationDepthsSeen: parseDepths(row.explanationDepthsJson),
    retrievalAttempts: row.retrievalAttempts,
    retrievalSuccesses: row.retrievalSuccesses,
    productionAttempts: row.productionAttempts,
    productionSuccesses: row.productionSuccesses,
    connectedPatternIds: parseStringArray(row.connectedPatternIdsJson),
    firstSeenAt: row.firstSeenAt,
    lastSeenAt: row.lastSeenAt,
    lastExploredAt: row.lastExploredAt,
    lastRetrievedAt: row.lastRetrievedAt,
    lastProducedAt: row.lastProducedAt,
  };
}

export async function loadLearningStateRecord(
  userId: string,
  patternId: string,
): Promise<LearningStateRecord | null> {
  const row = await prisma.userLearningPatternState.findUnique({
    where: { userId_patternId: { userId, patternId } },
  });

  if (!row) {
    return null;
  }

  return rowToRecord(row);
}

export async function persistLearningStateRecord(record: LearningStateRecord): Promise<LearningPatternState> {
  const state = computeLearningState(recordToInput(record));

  await prisma.userLearningPatternState.upsert({
    where: { userId_patternId: { userId: record.userId, patternId: record.patternId } },
    create: {
      userId: record.userId,
      patternId: record.patternId,
      exposureCount: record.exposureCount,
      distinctTextIdsJson: JSON.stringify(record.distinctTextIds),
      exploreCount: record.exploreCount,
      noticeCount: record.noticeCount,
      vocabularyVisitCount: record.vocabularyVisitCount,
      explanationDepthsJson: JSON.stringify(record.explanationDepthsSeen),
      retrievalAttempts: record.retrievalAttempts,
      retrievalSuccesses: record.retrievalSuccesses,
      productionAttempts: record.productionAttempts,
      productionSuccesses: record.productionSuccesses,
      connectedPatternIdsJson: JSON.stringify(record.connectedPatternIds),
      exposureLevel: state.dimensions.exposure,
      observationQuality: state.dimensions.observation,
      comprehensionEstimate: state.dimensions.comprehension,
      confidenceLevel: state.dimensions.confidence,
      reuseCapability: state.dimensions.reuse,
      temporalStability: state.dimensions.stability,
      lifecycleState: lifecycleToEnum(state.lifecycle),
      firstSeenAt: record.firstSeenAt,
      lastSeenAt: record.lastSeenAt,
      lastExploredAt: record.lastExploredAt,
      lastRetrievedAt: record.lastRetrievedAt,
      lastProducedAt: record.lastProducedAt,
      computedAt: new Date(state.computedAt),
    },
    update: {
      exposureCount: record.exposureCount,
      distinctTextIdsJson: JSON.stringify(record.distinctTextIds),
      exploreCount: record.exploreCount,
      noticeCount: record.noticeCount,
      vocabularyVisitCount: record.vocabularyVisitCount,
      explanationDepthsJson: JSON.stringify(record.explanationDepthsSeen),
      retrievalAttempts: record.retrievalAttempts,
      retrievalSuccesses: record.retrievalSuccesses,
      productionAttempts: record.productionAttempts,
      productionSuccesses: record.productionSuccesses,
      connectedPatternIdsJson: JSON.stringify(record.connectedPatternIds),
      exposureLevel: state.dimensions.exposure,
      observationQuality: state.dimensions.observation,
      comprehensionEstimate: state.dimensions.comprehension,
      confidenceLevel: state.dimensions.confidence,
      reuseCapability: state.dimensions.reuse,
      temporalStability: state.dimensions.stability,
      lifecycleState: lifecycleToEnum(state.lifecycle),
      firstSeenAt: record.firstSeenAt,
      lastSeenAt: record.lastSeenAt,
      lastExploredAt: record.lastExploredAt,
      lastRetrievedAt: record.lastRetrievedAt,
      lastProducedAt: record.lastProducedAt,
      computedAt: new Date(state.computedAt),
    },
  });

  return state;
}

export async function loadLearningPatternState(
  userId: string,
  patternId: string,
): Promise<LearningPatternState | null> {
  const record = await loadLearningStateRecord(userId, patternId);
  if (!record) {
    return null;
  }
  return computeLearningState(recordToInput(record));
}

function lifecycleToEnum(lifecycle: PatternLifecycleState): "LATENT" | "OBSERVED" | "NOTICED" | "UNDERSTOOD" | "CONNECTED" | "REUSED" | "MASTERED" {
  switch (lifecycle) {
    case "latent":
      return "LATENT";
    case "observed":
      return "OBSERVED";
    case "noticed":
      return "NOTICED";
    case "understood":
      return "UNDERSTOOD";
    case "connected":
      return "CONNECTED";
    case "reused":
      return "REUSED";
    case "mastered":
      return "MASTERED";
  }
}
