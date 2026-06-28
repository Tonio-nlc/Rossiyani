import type { CefrLevel } from "@/types/domain";

export type PatternStatus = "draft" | "canonical" | "deprecated";

export type PatternFrequency = "core" | "frequent" | "intermediate" | "advanced";

export type PatternDifficulty = 1 | 2 | 3 | 4 | 5;

export type PatternNetworkRelationType =
  | "prerequisite"
  | "reinforces"
  | "contrasts"
  | "specializes"
  | "often_confused_with"
  | "same_family";

export type DetectionRuleType = "morphology" | "syntax" | "lexical" | "phrase" | "ai_hint";

export type LearnerProfile = "francophone" | "all";

export type PatternExample = {
  id: string;
  russian: string;
  french: string;
  note?: string;
  textId?: string;
  sentenceId?: string;
  isCanonical: boolean;
};

export type CommonError = {
  wrong: string;
  why: string;
  correction: string;
  learnerProfile?: LearnerProfile;
};

export type PatternVariant = {
  label: string;
  description: string;
  example: PatternExample;
};

export type RelatedPattern = {
  patternId: string;
  relationType: PatternNetworkRelationType;
  label: string;
};

export type IntroductionConditions = {
  minExposureCount?: number;
  prerequisitePatternIds: string[];
  minReaderTextsCompleted?: number;
  editorialTextIds?: string[];
  avoidBeforeLevel?: CefrLevel;
};

export type MasteryConditions = {
  minExposureCount: number;
  minRetrievalGoodRate: number;
  minProductionSuccess?: number;
  minDaysSinceFirstSeen?: number;
};

export type DetectionRule = {
  type: DetectionRuleType;
  rule: string;
  weight: number;
};

export type LearningPattern = {
  id: string;
  slug: string;
  internalName: string;
  userFacingName: string;
  version: number;
  status: PatternStatus;
  familyId: string;
  taxonomyPath: string[];
  tags: string[];
  pedagogicalObjective: string;
  cognitiveSurprise: string;
  observation: string;
  insight: string;
  comprehension: string;
  formalization: string;
  nuances: string;
  examples: PatternExample[];
  counterExamples: PatternExample[];
  commonErrors: CommonError[];
  variants: PatternVariant[];
  prerequisites: string[];
  relatedPatterns: RelatedPattern[];
  confusedWith: string[];
  recommendedLevel: CefrLevel;
  frequency: PatternFrequency;
  difficulty: PatternDifficulty;
  introductionConditions: IntroductionConditions;
  masteryConditions: MasteryConditions;
  knowledgeConceptKeys: string[];
  detectionRules: DetectionRule[];
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
};

export type PatternFamily = {
  id: string;
  slug: string;
  titleFr: string;
  description: string;
  taxonomyRoot: string;
};

export type PatternPathStep = {
  patternId: string;
  introductionTextIds?: string[];
  reinforcementTextIds?: string[];
};

export type PatternPath = {
  id: string;
  slug: string;
  titleFr: string;
  description: string;
  objective: string;
  recommendedLevel: CefrLevel;
  collectionIds?: string[];
  steps: PatternPathStep[];
};

export type PatternCatalogData = {
  version: number;
  families: PatternFamily[];
  paths: PatternPath[];
  patterns: LearningPattern[];
};

export type PatternValidationIssue = {
  code: string;
  message: string;
  patternId?: string;
  path?: string;
  field?: string;
};

export type PatternValidationResult = {
  valid: boolean;
  errors: PatternValidationIssue[];
  warnings: PatternValidationIssue[];
};

export type RelatedPatternResult = {
  relation: RelatedPattern | { patternId: string; relationType: PatternNetworkRelationType; label: string };
  pattern: LearningPattern;
};

export type ExplanationDepth = "L1" | "L2" | "L3" | "L4" | "L5";

export type PatternSearchOptions = {
  query?: string;
  familyId?: string;
  taxonomyRoot?: string;
  recommendedLevel?: CefrLevel;
  status?: PatternStatus | PatternStatus[];
  tags?: string[];
  limit?: number;
};
