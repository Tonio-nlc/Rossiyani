import { z } from "zod";

const cefrLevelSchema = z.enum(["A1", "A2", "B1", "B2", "C1", "Native"]);

export const patternExampleSchema = z.object({
  id: z.string().min(1),
  russian: z.string().min(1),
  french: z.string().min(1),
  note: z.string().optional(),
  textId: z.string().optional(),
  sentenceId: z.string().optional(),
  isCanonical: z.boolean(),
});

export const commonErrorSchema = z.object({
  wrong: z.string().min(1),
  why: z.string().min(1),
  correction: z.string().min(1),
  learnerProfile: z.enum(["francophone", "all"]).optional(),
});

export const patternVariantSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
  example: patternExampleSchema,
});

export const relatedPatternSchema = z.object({
  patternId: z.string().min(1),
  relationType: z.enum([
    "prerequisite",
    "reinforces",
    "contrasts",
    "specializes",
    "often_confused_with",
    "same_family",
  ]),
  label: z.string().min(1),
});

export const introductionConditionsSchema = z.object({
  minExposureCount: z.number().int().min(0).optional(),
  prerequisitePatternIds: z.array(z.string().min(1)),
  minReaderTextsCompleted: z.number().int().min(0).optional(),
  editorialTextIds: z.array(z.string().min(1)).optional(),
  avoidBeforeLevel: cefrLevelSchema.optional(),
});

export const masteryConditionsSchema = z.object({
  minExposureCount: z.number().int().min(1),
  minRetrievalGoodRate: z.number().min(0).max(1),
  minProductionSuccess: z.number().int().min(0).optional(),
  minDaysSinceFirstSeen: z.number().int().min(0).optional(),
});

export const detectionRuleSchema = z.object({
  type: z.enum(["morphology", "syntax", "lexical", "phrase", "ai_hint"]),
  rule: z.string().min(1),
  weight: z.number().min(0).max(1),
});

const patternIdSchema = z
  .string()
  .min(1)
  .regex(/^lp\.[a-z0-9_.]+\.v\d+$/, "Pattern id must match lp.<family>.<slug>.v<version>");

export const learningPatternSchema = z.object({
  id: patternIdSchema,
  slug: z.string().min(1),
  internalName: z.string().min(1),
  userFacingName: z.string().min(1).max(120),
  version: z.number().int().min(1),
  status: z.enum(["draft", "canonical", "deprecated"]),
  familyId: z.string().min(1),
  taxonomyPath: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string()),
  pedagogicalObjective: z.string().min(1),
  cognitiveSurprise: z.string().min(1),
  observation: z.string().min(1),
  insight: z.string().min(1),
  comprehension: z.string().min(1),
  formalization: z.string(),
  nuances: z.string(),
  examples: z.array(patternExampleSchema),
  counterExamples: z.array(patternExampleSchema),
  commonErrors: z.array(commonErrorSchema),
  variants: z.array(patternVariantSchema),
  prerequisites: z.array(z.string().min(1)),
  relatedPatterns: z.array(relatedPatternSchema),
  confusedWith: z.array(z.string().min(1)),
  recommendedLevel: cefrLevelSchema,
  frequency: z.enum(["core", "frequent", "intermediate", "advanced"]),
  difficulty: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  introductionConditions: introductionConditionsSchema,
  masteryConditions: masteryConditionsSchema,
  knowledgeConceptKeys: z.array(z.string()),
  detectionRules: z.array(detectionRuleSchema),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  reviewedBy: z.string().optional(),
});

export const patternFamilySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  titleFr: z.string().min(1),
  description: z.string().min(1),
  taxonomyRoot: z.string().min(1),
});

export const patternPathStepSchema = z.object({
  patternId: z.string().min(1),
  introductionTextIds: z.array(z.string().min(1)).optional(),
  reinforcementTextIds: z.array(z.string().min(1)).optional(),
});

export const patternPathSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  titleFr: z.string().min(1),
  description: z.string().min(1),
  objective: z.string().min(1),
  recommendedLevel: cefrLevelSchema,
  collectionIds: z.array(z.string().min(1)).optional(),
  steps: z.array(patternPathStepSchema).min(1),
});

export const patternCatalogDataSchema = z.object({
  version: z.number().int().min(1),
  families: z.array(patternFamilySchema),
  paths: z.array(patternPathSchema),
  patterns: z.array(learningPatternSchema),
});
