import type {
  LearningPattern,
  PatternCatalogData,
  PatternFamily,
  PatternPath,
  PatternSearchOptions,
  PatternValidationResult,
  RelatedPatternResult,
} from "@/types/patterns";

import { loadCatalogFromData, loadCatalogFromDirectory } from "./load-catalog";
import { validateCatalog, validatePattern } from "./validate-catalog";

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function comparePatterns(a: LearningPattern, b: LearningPattern): number {
  const levelOrder = ["A1", "A2", "B1", "B2", "C1", "Native"];
  const levelDiff =
    levelOrder.indexOf(a.recommendedLevel) - levelOrder.indexOf(b.recommendedLevel);
  if (levelDiff !== 0) {
    return levelDiff;
  }
  if (a.difficulty !== b.difficulty) {
    return a.difficulty - b.difficulty;
  }
  return a.userFacingName.localeCompare(b.userFacingName, "fr");
}

export class PatternCatalogService {
  private readonly patternsById: Map<string, LearningPattern>;
  private readonly patternsByFamily: Map<string, LearningPattern[]>;
  private readonly pathsById: Map<string, PatternPath>;
  private readonly familiesById: Map<string, PatternFamily>;

  constructor(private readonly data: PatternCatalogData) {
    this.patternsById = new Map(data.patterns.map((pattern) => [pattern.id, pattern]));
    this.pathsById = new Map(data.paths.map((entry) => [entry.id, entry]));
    this.familiesById = new Map(data.families.map((family) => [family.id, family]));

    this.patternsByFamily = new Map();
    for (const pattern of data.patterns) {
      const bucket = this.patternsByFamily.get(pattern.familyId) ?? [];
      bucket.push(pattern);
      this.patternsByFamily.set(pattern.familyId, bucket);
    }

    for (const [familyId, patterns] of this.patternsByFamily) {
      patterns.sort(comparePatterns);
      this.patternsByFamily.set(familyId, patterns);
    }
  }

  static loadFromData(data: PatternCatalogData): PatternCatalogService {
    return new PatternCatalogService(loadCatalogFromData(data));
  }

  static async loadFromDirectory(rootDir?: string): Promise<PatternCatalogService> {
    const data = await loadCatalogFromDirectory(rootDir);
    return new PatternCatalogService(data);
  }

  getCatalogVersion(): number {
    return this.data.version;
  }

  getPattern(id: string): LearningPattern | null {
    return this.patternsById.get(id) ?? null;
  }

  getPatterns(options?: PatternSearchOptions): LearningPattern[] {
    let results = [...this.data.patterns];

    if (options?.familyId) {
      results = results.filter((pattern) => pattern.familyId === options.familyId);
    }

    if (options?.taxonomyRoot) {
      results = results.filter((pattern) => pattern.taxonomyPath[0] === options.taxonomyRoot);
    }

    if (options?.recommendedLevel) {
      results = results.filter((pattern) => pattern.recommendedLevel === options.recommendedLevel);
    }

    if (options?.status) {
      const statuses = Array.isArray(options.status) ? options.status : [options.status];
      results = results.filter((pattern) => statuses.includes(pattern.status));
    }

    if (options?.tags?.length) {
      results = results.filter((pattern) =>
        options.tags!.every((tag) => pattern.tags.includes(tag)),
      );
    }

    if (options?.query?.trim()) {
      const query = normalizeSearchText(options.query);
      results = results.filter((pattern) => {
        const haystack = [
          pattern.id,
          pattern.slug,
          pattern.internalName,
          pattern.userFacingName,
          pattern.pedagogicalObjective,
          ...pattern.tags,
          ...pattern.taxonomyPath,
          ...pattern.knowledgeConceptKeys,
        ]
          .join(" ")
          .toLowerCase();
        return normalizeSearchText(haystack).includes(query);
      });
    }

    results.sort(comparePatterns);

    if (options?.limit && options.limit > 0) {
      return results.slice(0, options.limit);
    }

    return results;
  }

  getPatternsByFamily(familyId: string): LearningPattern[] {
    return [...(this.patternsByFamily.get(familyId) ?? [])];
  }

  getFamilies(): PatternFamily[] {
    return [...this.data.families];
  }

  getFamily(familyId: string): PatternFamily | null {
    return this.familiesById.get(familyId) ?? null;
  }

  getPrerequisites(patternId: string): LearningPattern[] {
    const pattern = this.getPattern(patternId);
    if (!pattern) {
      return [];
    }

    const ids = new Set([
      ...pattern.prerequisites,
      ...pattern.introductionConditions.prerequisitePatternIds,
    ]);

    return [...ids]
      .map((id) => this.getPattern(id))
      .filter((entry): entry is LearningPattern => entry !== null)
      .sort(comparePatterns);
  }

  getDependents(patternId: string): LearningPattern[] {
    return this.getPatterns().filter(
      (pattern) =>
        pattern.prerequisites.includes(patternId) ||
        pattern.introductionConditions.prerequisitePatternIds.includes(patternId),
    );
  }

  getRelatedPatterns(patternId: string): RelatedPatternResult[] {
    const pattern = this.getPattern(patternId);
    if (!pattern) {
      return [];
    }

    const results: RelatedPatternResult[] = [];

    for (const relation of pattern.relatedPatterns) {
      const related = this.getPattern(relation.patternId);
      if (related) {
        results.push({ relation, pattern: related });
      }
    }

    for (const confusedId of pattern.confusedWith) {
      const related = this.getPattern(confusedId);
      if (related) {
        results.push({
          relation: {
            patternId: confusedId,
            relationType: "often_confused_with",
            label: related.userFacingName,
          },
          pattern: related,
        });
      }
    }

    for (const dependent of this.getDependents(patternId)) {
      if (results.some((entry) => entry.pattern.id === dependent.id)) {
        continue;
      }
      results.push({
        relation: {
          patternId: dependent.id,
          relationType: "reinforces",
          label: dependent.userFacingName,
        },
        pattern: dependent,
      });
    }

    return results;
  }

  searchPatterns(query: string, options?: Omit<PatternSearchOptions, "query">): LearningPattern[] {
    return this.getPatterns({ ...options, query });
  }

  getLearningPath(pathId: string): PatternPath | null {
    return this.pathsById.get(pathId) ?? null;
  }

  getLearningPaths(): PatternPath[] {
    return [...this.data.paths];
  }

  getLearningPathPatterns(pathId: string): LearningPattern[] {
    const learningPath = this.getLearningPath(pathId);
    if (!learningPath) {
      return [];
    }

    return learningPath.steps
      .map((step) => this.getPattern(step.patternId))
      .filter((pattern): pattern is LearningPattern => pattern !== null);
  }

  validatePattern(pattern: unknown): PatternValidationResult {
    return validatePattern(pattern);
  }

  validateCatalog(): PatternValidationResult {
    return validateCatalog(this.data, { requireCompletePaths: true });
  }
}

let cachedCatalog: PatternCatalogService | null = null;

export async function getPatternCatalogService(): Promise<PatternCatalogService> {
  if (!cachedCatalog) {
    cachedCatalog = await PatternCatalogService.loadFromDirectory();
  }
  return cachedCatalog;
}

export function resetPatternCatalogCache(): void {
  cachedCatalog = null;
}
