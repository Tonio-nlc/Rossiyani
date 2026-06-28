import type { ExplanationDepth, IntroductionConditions, MasteryConditions } from "@/types/patterns";

/**
 * Lifecycle labels — derived summary for modules that need a single UX state.
 * Not a score; dimensions remain authoritative.
 */
export type PatternLifecycleState =
  | "latent"
  | "observed"
  | "noticed"
  | "understood"
  | "connected"
  | "reused"
  | "mastered";

/**
 * Six independent pedagogical dimensions (0–1).
 * Never collapse into a single mastery score.
 */
export type LearningStateDimensions = {
  /** Volume and diversity of passive contact (reading). */
  exposure: number;
  /** Quality of active attention (explore, notice, vocabulary depth). */
  observation: number;
  /** Estimated grasp from explanations consumed (L1–L5). */
  comprehension: number;
  /** Reliability of recall / performance under pressure. */
  confidence: number;
  /** Ability to retrieve or produce the pattern in Review / Compose. */
  reuse: number;
  /** Retention over time — decays with absence, rises with spaced success. */
  stability: number;
};

export type LearningStateEvidence = {
  exposureCount: number;
  distinctTextCount: number;
  exploreCount: number;
  noticeCount: number;
  vocabularyVisitCount: number;
  explanationDepthsSeen: ExplanationDepth[];
  retrievalAttempts: number;
  retrievalSuccesses: number;
  productionAttempts: number;
  productionSuccesses: number;
  connectedPatternIds: string[];
  daysSinceLastContact: number | null;
};

/**
 * Canonical output — all pedagogical consumers should use this object.
 */
export type LearningPatternState = {
  userId: string;
  patternId: string;
  dimensions: LearningStateDimensions;
  lifecycle: PatternLifecycleState;
  maxDepthAllowed: ExplanationDepth | null;
  evidence: LearningStateEvidence;
  computedAt: string;
};

/**
 * Raw aggregates fed into the engine (from DB, events, or encounter bridge).
 */
export type LearningStateInput = {
  userId: string;
  patternId: string;
  exposureCount: number;
  distinctTextIds: string[];
  exploreCount: number;
  noticeCount: number;
  vocabularyVisitCount: number;
  explanationDepthsSeen: ExplanationDepth[];
  retrievalAttempts: number;
  retrievalSuccesses: number;
  productionAttempts: number;
  productionSuccesses: number;
  connectedPatternIds: string[];
  firstSeenAt: Date | null;
  lastSeenAt: Date | null;
  lastExploredAt: Date | null;
  lastRetrievedAt: Date | null;
  lastProducedAt: Date | null;
  introductionConditions?: IntroductionConditions;
  masteryConditions?: MasteryConditions;
  /** Reference time for stability decay (default: now). */
  asOf?: Date;
};

export type LearningStateRecord = Omit<LearningStateInput, "introductionConditions" | "masteryConditions" | "asOf">;

export type PatternLearningEvent =
  | { type: "exposure"; textId: string; sentenceId: string; at?: Date }
  | { type: "notice"; surface: "reader" | "vocabulary"; at?: Date }
  | { type: "explore"; surface: "reader" | "vocabulary"; depth?: ExplanationDepth; at?: Date }
  | { type: "explain"; depth: ExplanationDepth; at?: Date }
  | { type: "connect"; relatedPatternId: string; at?: Date }
  | { type: "retrieve"; success: boolean; at?: Date }
  | { type: "produce"; success: boolean; at?: Date };

export function emptyLearningStateRecord(userId: string, patternId: string): LearningStateRecord {
  return {
    userId,
    patternId,
    exposureCount: 0,
    distinctTextIds: [],
    exploreCount: 0,
    noticeCount: 0,
    vocabularyVisitCount: 0,
    explanationDepthsSeen: [],
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
