import type { ExplanationDepth } from "@/types/patterns";
import type { LearningStateDimensions, LearningStateInput } from "@/types/learning-state";

const DEPTH_ORDER: ExplanationDepth[] = ["L1", "L2", "L3", "L4", "L5"];

const DEPTH_WEIGHT: Record<ExplanationDepth, number> = {
  L1: 0.2,
  L2: 0.45,
  L3: 0.72,
  L4: 0.88,
  L5: 1,
};

function clamp01(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function maxDepthSeen(depths: ExplanationDepth[]): ExplanationDepth | null {
  let maxIndex = -1;
  for (const depth of depths) {
    const index = DEPTH_ORDER.indexOf(depth);
    if (index > maxIndex) {
      maxIndex = index;
    }
  }
  return maxIndex >= 0 ? DEPTH_ORDER[maxIndex]! : null;
}

function daysBetween(later: Date, earlier: Date): number {
  return (later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24);
}

function lastContactDate(input: LearningStateInput): Date | null {
  const candidates = [
    input.lastSeenAt,
    input.lastExploredAt,
    input.lastRetrievedAt,
    input.lastProducedAt,
  ].filter((value): value is Date => value instanceof Date);

  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest,
  );
}

export function computeDimensions(input: LearningStateInput): LearningStateDimensions {
  const minExposure = input.introductionConditions?.minExposureCount ?? 3;
  const distinctTexts = input.distinctTextIds.length;

  const volume = clamp01(input.exposureCount / Math.max(minExposure * 2, 1));
  const diversity = clamp01(distinctTexts / 2);
  const exposure = clamp01(volume * 0.65 + diversity * 0.35);

  const exploreSignal = clamp01(input.exploreCount / 3);
  const noticeSignal = clamp01(input.noticeCount / 2);
  const vocabSignal = clamp01(input.vocabularyVisitCount / 2);
  const observation = clamp01(
    Math.max(exploreSignal, noticeSignal * 0.45 + vocabSignal * 0.55),
  );

  const deepest = maxDepthSeen(input.explanationDepthsSeen);
  let comprehension = deepest ? DEPTH_WEIGHT[deepest] : 0;
  if (!deepest && input.exploreCount > 0) {
    comprehension = 0.12;
  }
  if (input.explanationDepthsSeen.filter((depth) => depth === "L3").length >= 2) {
    comprehension = clamp01(comprehension + 0.08);
  }

  const retrievalRate =
    input.retrievalAttempts > 0
      ? input.retrievalSuccesses / input.retrievalAttempts
      : null;
  const confidence = clamp01(
    retrievalRate !== null ? retrievalRate * 0.72 + comprehension * 0.28 : comprehension * 0.35,
  );

  const productionRate =
    input.productionAttempts > 0
      ? input.productionSuccesses / input.productionAttempts
      : 0;
  const reuse = clamp01(
    productionRate * 0.55 +
      (retrievalRate ?? 0) * 0.45 +
      (input.productionAttempts === 0 && input.retrievalAttempts === 0 ? comprehension * 0.1 : 0),
  );

  const asOf = input.asOf ?? new Date();
  const lastContact = lastContactDate(input);
  const daysSince = lastContact ? daysBetween(asOf, lastContact) : null;
  const engagement =
    input.exposureCount + input.exploreCount * 2 + input.retrievalSuccesses + input.productionSuccesses;
  const decay = daysSince === null ? 0 : Math.exp(-daysSince / 30);
  const stability = clamp01((engagement / 12) * decay);

  return {
    exposure,
    observation,
    comprehension,
    confidence,
    reuse,
    stability,
  };
}

export function buildEvidence(
  input: LearningStateInput,
  asOf: Date,
): import("@/types/learning-state").LearningStateEvidence {
  const lastContact = lastContactDate(input);
  return {
    exposureCount: input.exposureCount,
    distinctTextCount: input.distinctTextIds.length,
    exploreCount: input.exploreCount,
    noticeCount: input.noticeCount,
    vocabularyVisitCount: input.vocabularyVisitCount,
    explanationDepthsSeen: [...input.explanationDepthsSeen],
    retrievalAttempts: input.retrievalAttempts,
    retrievalSuccesses: input.retrievalSuccesses,
    productionAttempts: input.productionAttempts,
    productionSuccesses: input.productionSuccesses,
    connectedPatternIds: [...input.connectedPatternIds],
    daysSinceLastContact: lastContact ? daysBetween(asOf, lastContact) : null,
  };
}
