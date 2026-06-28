import type { ExplanationDepth, MasteryConditions } from "@/types/patterns";
import type {
  LearningStateDimensions,
  PatternLifecycleState,
} from "@/types/learning-state";

const DEFAULT_MASTERY: MasteryConditions = {
  minExposureCount: 6,
  minRetrievalGoodRate: 0.8,
};

export function deriveLifecycle(
  dimensions: LearningStateDimensions,
  evidence: {
    distinctTextCount: number;
    connectedPatternIds: string[];
    exposureCount: number;
  },
  masteryConditions: MasteryConditions = DEFAULT_MASTERY,
): PatternLifecycleState {
  const { exposure, observation, comprehension, reuse, stability, confidence } = dimensions;

  const masteryExposureOk = evidence.exposureCount >= masteryConditions.minExposureCount;
  const masteryReuseOk = reuse >= masteryConditions.minRetrievalGoodRate;
  const masteryStabilityOk = stability >= 0.45;

  if (masteryExposureOk && masteryReuseOk && masteryStabilityOk && comprehension >= 0.7) {
    return "mastered";
  }

  if (reuse >= 0.55 || (confidence >= 0.65 && comprehension >= 0.5)) {
    return "reused";
  }

  if (
    evidence.connectedPatternIds.length > 0 ||
    (evidence.distinctTextCount >= 2 && comprehension >= 0.4)
  ) {
    return "connected";
  }

  if (comprehension >= 0.45) {
    return "understood";
  }

  if (observation >= 0.28) {
    return "noticed";
  }

  if (exposure >= 0.32) {
    return "observed";
  }

  return "latent";
}

export function maxDepthForLifecycle(lifecycle: PatternLifecycleState): ExplanationDepth | null {
  switch (lifecycle) {
    case "latent":
      return null;
    case "observed":
      return "L1";
    case "noticed":
      return "L2";
    case "understood":
    case "connected":
      return "L3";
    case "reused":
      return "L4";
    case "mastered":
      return "L5";
    default:
      return null;
  }
}
