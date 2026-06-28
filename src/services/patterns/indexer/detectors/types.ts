import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { LearningPattern } from "@/types/patterns";
import type { PatternDetectionEvidence, PatternInstanceSpan } from "@/types/pattern-instances";

export type DetectionCandidate = {
  patternId: string;
  span: PatternInstanceSpan;
  confidence: number;
  detectionScore: number;
  evidence: PatternDetectionEvidence[];
  triggeringTokens: number[];
};

export type DetectionContext = {
  analysis: SentenceAnalysisOutput;
  pattern: LearningPattern;
  conceptKeys: string[];
};

export type DetectionRuleHandler = (context: DetectionContext) => DetectionCandidate | null;
