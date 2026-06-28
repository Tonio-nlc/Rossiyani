import path from "node:path";

import { describe, expect, it } from "vitest";

import type { LearningPattern, PatternCatalogData } from "@/types/patterns";
import {
  PatternCatalogService,
  loadCatalogFromData,
  loadCatalogFromDirectory,
  validateCatalog,
  validatePattern,
} from "@/services/patterns";

const CATALOG_ROOT = path.join(process.cwd(), "data", "patterns");

function minimalPattern(overrides: Partial<LearningPattern> & Pick<LearningPattern, "id">): LearningPattern {
  const base: LearningPattern = {
    id: overrides.id,
    slug: overrides.slug ?? "test_slug",
    internalName: "Test pattern",
    userFacingName: "Pattern de test",
    version: 1,
    status: "draft",
    familyId: "morphology.case_system",
    taxonomyPath: ["morphology", "case_system", "test"],
    tags: [],
    pedagogicalObjective: "Objectif pédagogique de test.",
    cognitiveSurprise: "Surprise cognitive de test.",
    observation: "Observation de test.",
    insight: "Insight de test.",
    comprehension: "Compréhension de test.",
    formalization: "",
    nuances: "",
    examples: [
      {
        id: "ex.test.1",
        russian: "Тест.",
        french: "Test.",
        isCanonical: true,
      },
    ],
    counterExamples: [],
    commonErrors: [],
    variants: [],
    prerequisites: [],
    relatedPatterns: [],
    confusedWith: [],
    recommendedLevel: "A1",
    frequency: "core",
    difficulty: 1,
    introductionConditions: {
      prerequisitePatternIds: [],
    },
    masteryConditions: {
      minExposureCount: 3,
      minRetrievalGoodRate: 0.7,
    },
    knowledgeConceptKeys: [],
    detectionRules: [],
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  };

  return { ...base, ...overrides };
}

describe("pattern catalog — load", () => {
  it("loads the seed catalog from data/patterns", async () => {
    const catalog = await loadCatalogFromDirectory(CATALOG_ROOT);
    expect(catalog.version).toBe(1);
    expect(catalog.patterns.length).toBe(20);
    expect(catalog.families.length).toBeGreaterThan(0);
    expect(catalog.paths.length).toBe(4);
  });

  it("exposes patterns through PatternCatalogService", async () => {
    const service = await PatternCatalogService.loadFromDirectory(CATALOG_ROOT);
    const pattern = service.getPattern("lp.morphology.role_terminations.v1");
    expect(pattern?.userFacingName).toBe("Les mots changent selon leur rôle");
    expect(service.getPatterns()).toHaveLength(20);
  });
});

describe("pattern catalog — search", () => {
  it("searches by query across names and tags", async () => {
    const service = await PatternCatalogService.loadFromDirectory(CATALOG_ROOT);
    const results = service.searchPatterns("datif");
    expect(results.some((pattern) => pattern.id === "lp.morphology.dative_recipient.v1")).toBe(true);
  });

  it("filters by family and level", async () => {
    const service = await PatternCatalogService.loadFromDirectory(CATALOG_ROOT);
    const casePatterns = service.getPatternsByFamily("morphology.case_system");
    expect(casePatterns.map((pattern) => pattern.id)).toEqual(
      expect.arrayContaining([
        "lp.morphology.role_terminations.v1",
        "lp.morphology.dative_recipient.v1",
      ]),
    );

    const a1 = service.getPatterns({ recommendedLevel: "A1" });
    expect(a1.every((pattern) => pattern.recommendedLevel === "A1")).toBe(true);
  });
});

describe("pattern catalog — relations", () => {
  it("returns prerequisite patterns in order", async () => {
    const service = await PatternCatalogService.loadFromDirectory(CATALOG_ROOT);
    const prerequisites = service.getPrerequisites("lp.syntax.possession_existence.v1");
    expect(prerequisites.map((pattern) => pattern.id)).toContain(
      "lp.morphology.role_terminations.v1",
    );
  });

  it("returns related patterns and dependents", async () => {
    const service = await PatternCatalogService.loadFromDirectory(CATALOG_ROOT);
    const related = service.getRelatedPatterns("lp.morphology.dative_recipient.v1");
    expect(related.some((entry) => entry.pattern.id === "lp.verbs.preferred_constructions.v1")).toBe(
      true,
    );

    const dependents = service.getDependents("lp.morphology.role_terminations.v1");
    expect(dependents.length).toBeGreaterThanOrEqual(2);
  });

  it("resolves learning paths to loaded patterns", async () => {
    const service = await PatternCatalogService.loadFromDirectory(CATALOG_ROOT);
    const path = service.getLearningPath("path.case_and_roles");
    expect(path?.steps).toHaveLength(3);

    const patterns = service.getLearningPathPatterns("path.case_and_roles");
    expect(patterns.map((pattern) => pattern.slug)).toEqual([
      "role_terminations",
      "possession_existence",
      "dative_recipient",
    ]);
  });

  it("resolves the A1 foundation pack path with 18 patterns", async () => {
    const service = await PatternCatalogService.loadFromDirectory(CATALOG_ROOT);
    const foundationPath = service.getLearningPath("path.a1_foundation");
    expect(foundationPath?.steps).toHaveLength(18);

    const foundationPatterns = service.getLearningPathPatterns("path.a1_foundation");
    expect(foundationPatterns[0]?.slug).toBe("stress_marks");
    expect(foundationPatterns.at(-1)?.slug).toBe("prepositional_topic");
  });
});

describe("pattern catalog — validation", () => {
  it("accepts the seed catalog", async () => {
    const catalog = await loadCatalogFromDirectory(CATALOG_ROOT);
    const result = validateCatalog(catalog, { requireCompletePaths: true });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects duplicate pattern ids", () => {
    const pattern = minimalPattern({ id: "lp.morphology.role_terminations.v1", slug: "dup_a" });
    const duplicate = minimalPattern({ id: "lp.morphology.role_terminations.v1", slug: "dup_b" });

    const catalog: PatternCatalogData = {
      version: 1,
      families: [
        {
          id: "morphology.case_system",
          slug: "case_system",
          titleFr: "Cas",
          description: "Test",
          taxonomyRoot: "morphology",
        },
      ],
      paths: [],
      patterns: [pattern, duplicate],
    };

    const result = validateCatalog(catalog);
    expect(result.valid).toBe(false);
    expect(result.errors.some((issue) => issue.code === "DUPLICATE_PATTERN_ID")).toBe(true);
  });

  it("rejects missing prerequisites", () => {
    const catalog: PatternCatalogData = {
      version: 1,
      families: [
        {
          id: "syntax.possession",
          slug: "possession",
          titleFr: "Possession",
          description: "Test",
          taxonomyRoot: "syntax",
        },
      ],
      paths: [],
      patterns: [
        minimalPattern({
          id: "lp.syntax.possession_existence.v1",
          slug: "possession_existence",
          familyId: "syntax.possession",
          prerequisites: ["lp.morphology.role_terminations.v1"],
          introductionConditions: {
            prerequisitePatternIds: ["lp.morphology.role_terminations.v1"],
          },
        }),
      ],
    };

    const result = validateCatalog(catalog);
    expect(result.valid).toBe(false);
    expect(result.errors.some((issue) => issue.code === "UNKNOWN_PATTERN_REFERENCE")).toBe(true);
  });

  it("rejects prerequisite cycles", () => {
    const catalog: PatternCatalogData = {
      version: 1,
      families: [
        {
          id: "morphology.case_system",
          slug: "case_system",
          titleFr: "Cas",
          description: "Test",
          taxonomyRoot: "morphology",
        },
      ],
      paths: [],
      patterns: [
        minimalPattern({
          id: "lp.morphology.pattern_a.v1",
          slug: "pattern_a",
          prerequisites: ["lp.morphology.pattern_b.v1"],
        }),
        minimalPattern({
          id: "lp.morphology.pattern_b.v1",
          slug: "pattern_b",
          prerequisites: ["lp.morphology.pattern_a.v1"],
        }),
      ],
    };

    const result = validateCatalog(catalog);
    expect(result.valid).toBe(false);
    expect(result.errors.some((issue) => issue.code === "PREREQUISITE_CYCLE")).toBe(true);
  });

  it("warns on unknown related patterns in a partial catalog", () => {
    const catalog: PatternCatalogData = {
      version: 1,
      families: [
        {
          id: "morphology.case_system",
          slug: "case_system",
          titleFr: "Cas",
          description: "Test",
          taxonomyRoot: "morphology",
        },
      ],
      paths: [],
      patterns: [
        minimalPattern({
          id: "lp.morphology.role_terminations.v1",
          slug: "role_terminations",
          relatedPatterns: [
            {
              patternId: "lp.morphology.negation_genitive.v1",
              relationType: "specializes",
              label: "Négation",
            },
          ],
        }),
      ],
    };

    const result = validateCatalog(catalog);
    expect(result.valid).toBe(true);
    expect(result.warnings.some((issue) => issue.code === "UNKNOWN_PATTERN_REFERENCE")).toBe(true);
  });

  it("validates a single pattern with validatePattern", () => {
    const result = validatePattern({ id: "not-a-pattern" });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("loads in-memory catalog via loadCatalogFromData", () => {
    const catalog: PatternCatalogData = {
      version: 1,
      families: [
        {
          id: "syntax.information_structure",
          slug: "information_structure",
          titleFr: "Info",
          description: "Test",
          taxonomyRoot: "syntax",
        },
      ],
      paths: [],
      patterns: [
        minimalPattern({
          id: "lp.syntax.zero_subject.v1",
          slug: "zero_subject",
          familyId: "syntax.information_structure",
        }),
      ],
    };

    const loaded = loadCatalogFromData(catalog);
    const service = PatternCatalogService.loadFromData(loaded);
    expect(service.getPattern("lp.syntax.zero_subject.v1")).not.toBeNull();
  });
});
