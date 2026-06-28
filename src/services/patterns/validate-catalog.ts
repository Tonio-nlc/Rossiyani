import type {
  LearningPattern,
  PatternCatalogData,
  PatternFamily,
  PatternPath,
  PatternValidationIssue,
  PatternValidationResult,
} from "@/types/patterns";

import { learningPatternSchema } from "./schemas";

function issue(
  code: string,
  message: string,
  extra?: Partial<PatternValidationIssue>,
): PatternValidationIssue {
  return { code, message, ...extra };
}

function collectPatternIds(data: PatternCatalogData): Set<string> {
  return new Set(data.patterns.map((pattern) => pattern.id));
}

function detectPrerequisiteCycle(patterns: LearningPattern[]): string[] | null {
  const byId = new Map(patterns.map((pattern) => [pattern.id, pattern]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(id: string, stack: string[]): string[] | null {
    if (!byId.has(id)) {
      return null;
    }
    if (visiting.has(id)) {
      return [...stack, id];
    }
    if (visited.has(id)) {
      return null;
    }

    visiting.add(id);
    const pattern = byId.get(id)!;
    for (const prerequisiteId of pattern.prerequisites) {
      const cycle = dfs(prerequisiteId, [...stack, id]);
      if (cycle) {
        return cycle;
      }
    }
    visiting.delete(id);
    visited.add(id);
    return null;
  }

  for (const pattern of patterns) {
    const cycle = dfs(pattern.id, []);
    if (cycle) {
      return cycle;
    }
  }

  return null;
}

function validateReferenceIds(
  pattern: LearningPattern,
  knownIds: Set<string>,
  errors: PatternValidationIssue[],
  warnings: PatternValidationIssue[],
): void {
  const requireKnown = (targetId: string, field: string) => {
    if (!knownIds.has(targetId)) {
      errors.push(
        issue("UNKNOWN_PATTERN_REFERENCE", `Unknown pattern reference: ${targetId}`, {
          patternId: pattern.id,
          field,
        }),
      );
    }
  };

  const warnIfUnknown = (targetId: string, field: string) => {
    if (!knownIds.has(targetId)) {
      warnings.push(
        issue("UNKNOWN_PATTERN_REFERENCE", `Unknown pattern reference: ${targetId}`, {
          patternId: pattern.id,
          field,
        }),
      );
    }
  };

  for (const prerequisiteId of pattern.prerequisites) {
    requireKnown(prerequisiteId, "prerequisites");
    if (prerequisiteId === pattern.id) {
      errors.push(
        issue("SELF_PREREQUISITE", "A pattern cannot be its own prerequisite", {
          patternId: pattern.id,
          field: "prerequisites",
        }),
      );
    }
  }

  for (const prerequisiteId of pattern.introductionConditions.prerequisitePatternIds) {
    requireKnown(prerequisiteId, "introductionConditions.prerequisitePatternIds");
  }

  for (const related of pattern.relatedPatterns) {
    warnIfUnknown(related.patternId, "relatedPatterns");
  }

  for (const confusedId of pattern.confusedWith) {
    warnIfUnknown(confusedId, "confusedWith");
  }
}

export function validatePattern(pattern: unknown): PatternValidationResult {
  const errors: PatternValidationIssue[] = [];
  const warnings: PatternValidationIssue[] = [];

  const parsed = learningPatternSchema.safeParse(pattern);
  if (!parsed.success) {
    for (const entry of parsed.error.issues) {
      errors.push(
        issue("SCHEMA_INVALID", entry.message, {
          field: entry.path.join("."),
        }),
      );
    }
    return { valid: false, errors, warnings };
  }

  const value = parsed.data;
  if (value.id !== `lp.${value.taxonomyPath.slice(0, 2).join(".")}.${value.slug}.v${value.version}` &&
      !value.id.startsWith("lp.")) {
    warnings.push(
      issue("ID_FORMAT_MISMATCH", "Pattern id format should follow lp.<scope>.<slug>.v<version>", {
        patternId: value.id,
        field: "id",
      }),
    );
  }

  if (value.difficulty >= 3 && !value.nuances.trim()) {
    warnings.push(
      issue("MISSING_NUANCES", "Patterns with difficulty ≥ 3 should define nuances", {
        patternId: value.id,
        field: "nuances",
      }),
    );
  }

  if (value.examples.length < 1) {
    warnings.push(
      issue("FEW_EXAMPLES", "At least one example is recommended", {
        patternId: value.id,
        field: "examples",
      }),
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

export type ValidateCatalogOptions = {
  /** When true, learning paths must only reference loaded patterns. */
  requireCompletePaths?: boolean;
};

export function validateCatalog(
  data: PatternCatalogData,
  options: ValidateCatalogOptions = {},
): PatternValidationResult {
  const errors: PatternValidationIssue[] = [];
  const warnings: PatternValidationIssue[] = [];
  const patternIds = collectPatternIds(data);
  const familyIds = new Set(data.families.map((family) => family.id));
  const pathIds = new Set<string>();

  for (const pattern of data.patterns) {
    const result = validatePattern(pattern);
    errors.push(...result.errors.map((entry) => ({ ...entry, patternId: entry.patternId ?? pattern.id })));
    warnings.push(...result.warnings.map((entry) => ({ ...entry, patternId: entry.patternId ?? pattern.id })));
  }

  const seenPatternIds = new Set<string>();
  for (const pattern of data.patterns) {
    if (seenPatternIds.has(pattern.id)) {
      errors.push(
        issue("DUPLICATE_PATTERN_ID", `Duplicate pattern id: ${pattern.id}`, {
          patternId: pattern.id,
        }),
      );
    }
    seenPatternIds.add(pattern.id);

    if (!familyIds.has(pattern.familyId)) {
      errors.push(
        issue("UNKNOWN_FAMILY", `Unknown familyId: ${pattern.familyId}`, {
          patternId: pattern.id,
          field: "familyId",
        }),
      );
    }

    validateReferenceIds(pattern, patternIds, errors, warnings);
  }

  const cycle = detectPrerequisiteCycle(data.patterns);
  if (cycle) {
    errors.push(
      issue("PREREQUISITE_CYCLE", `Prerequisite cycle detected: ${cycle.join(" → ")}`, {
        field: "prerequisites",
      }),
    );
  }

  const seenFamilyIds = new Set<string>();
  for (const family of data.families) {
    if (seenFamilyIds.has(family.id)) {
      errors.push(issue("DUPLICATE_FAMILY_ID", `Duplicate family id: ${family.id}`));
    }
    seenFamilyIds.add(family.id);
  }

  const learningPathIds = new Set<string>();
  for (const path of data.paths) {
    if (learningPathIds.has(path.id)) {
      errors.push(issue("DUPLICATE_PATH_ID", `Duplicate path id: ${path.id}`, { path: path.id }));
    }
    learningPathIds.add(path.id);

    for (const step of path.steps) {
      if (!patternIds.has(step.patternId)) {
        const message = `Learning path references unknown pattern: ${step.patternId}`;
        if (options.requireCompletePaths) {
          errors.push(
            issue("UNKNOWN_PATH_PATTERN", message, {
              path: path.id,
              field: "steps.patternId",
            }),
          );
        } else {
          warnings.push(
            issue("UNKNOWN_PATH_PATTERN", message, {
              path: path.id,
              field: "steps.patternId",
            }),
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function assertValidCatalog(
  data: PatternCatalogData,
  options?: ValidateCatalogOptions,
): PatternCatalogData {
  const result = validateCatalog(data, options);
  if (!result.valid) {
    const summary = result.errors.map((entry) => entry.message).join("; ");
    throw new Error(`Invalid pattern catalog: ${summary}`);
  }
  return data;
}

export type { PatternFamily, PatternPath };
