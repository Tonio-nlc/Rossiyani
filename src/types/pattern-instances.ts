import type { ExplanationDepth } from "@/types/patterns";

export type { ExplanationDepth };

export type PatternDetectionSource =
  | "detection_rule"
  | "concept_mapping"
  | "editorial_hint";

export type PatternDetectionEvidence = {
  source: PatternDetectionSource;
  rule?: string;
  conceptKey?: string;
  message: string;
  weight: number;
};

export type PatternInstanceSpan = {
  startPosition: number;
  endPosition: number;
};

export type PatternInstance = {
  id?: string;
  patternId: string;
  sentenceId: string;
  textId: string;
  span: PatternInstanceSpan;
  salience: number;
  confidence: number;
  detectionScore: number;
  evidence: PatternDetectionEvidence[];
  triggeringTokens: number[];
  introductionLevel: ExplanationDepth;
  isPrimary: boolean;
  occurrenceId?: string | null;
  phraseOccurrenceId?: string | null;
  detectedAt: string;
};

export type PrimarySelectionReasonCode =
  | "sole_candidate"
  | "editorial_introduction"
  | "detection_score"
  | "pattern_frequency"
  | "locality"
  | "recommended_level";

export type PrimarySelectionReason = {
  code: PrimarySelectionReasonCode;
  message: string;
  weight: number;
};

export type SentencePatternIndex = {
  sentenceId: string;
  textId: string;
  instances: PatternInstance[];
  primaryPatternId: string | null;
  secondaryPatternIds: string[];
  indexedAt: string;
  primarySelectionReasons: PrimarySelectionReason[];
};

export type PatternIndexerKnowledgeContext = {
  conceptKeys: string[];
  occurrenceIdsByPosition: Record<number, string>;
  phraseOccurrenceIds: Array<{
    startPosition: number;
    endPosition: number;
    id: string;
  }>;
};

export type PatternIndexerInput = {
  sentenceId: string;
  textId: string;
  analysis: import("@/services/ai/schemas").SentenceAnalysisOutput;
  catalog: import("@/services/patterns/pattern-catalog-service").PatternCatalogService;
  knowledgeContext?: PatternIndexerKnowledgeContext;
  detectedAt?: string;
};

export type PatternIndexerResult = SentencePatternIndex;

export type PatternIndexPersistResult = {
  instancesCreated: number;
  instancesUpdated: number;
  instancesRemoved: number;
};
