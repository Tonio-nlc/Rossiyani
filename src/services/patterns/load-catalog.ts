import { readFile } from "node:fs/promises";
import path from "node:path";

import type { LearningPattern, PatternCatalogData } from "@/types/patterns";

import { patternCatalogDataSchema } from "./schemas";
import { assertValidCatalog, type ValidateCatalogOptions } from "./validate-catalog";

const DEFAULT_CATALOG_ROOT = path.join(process.cwd(), "data", "patterns");

type CatalogManifest = {
  version: number;
  familiesFile: string;
  pathsFile: string;
  patternFiles: string[];
};

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function loadPatternFile(filePath: string): Promise<LearningPattern> {
  return readJson<LearningPattern>(filePath);
}

export async function loadCatalogFromDirectory(
  rootDir: string = DEFAULT_CATALOG_ROOT,
  options: ValidateCatalogOptions = { requireCompletePaths: true },
): Promise<PatternCatalogData> {
  const manifestPath = path.join(rootDir, "catalog.manifest.json");
  const manifest = await readJson<CatalogManifest>(manifestPath);

  const [families, paths, patterns] = await Promise.all([
    readJson<PatternCatalogData["families"]>(path.join(rootDir, manifest.familiesFile)),
    readJson<PatternCatalogData["paths"]>(path.join(rootDir, manifest.pathsFile)),
    Promise.all(
      manifest.patternFiles.map((relativePath) =>
        loadPatternFile(path.join(rootDir, relativePath)),
      ),
    ),
  ]);

  const catalog: PatternCatalogData = {
    version: manifest.version,
    families,
    paths,
    patterns,
  };

  const parsed = patternCatalogDataSchema.safeParse(catalog);
  if (!parsed.success) {
    const summary = parsed.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Pattern catalog schema invalid: ${summary}`);
  }

  return assertValidCatalog(parsed.data, options);
}

export function loadCatalogFromData(
  data: PatternCatalogData,
  options: ValidateCatalogOptions = { requireCompletePaths: true },
): PatternCatalogData {
  const parsed = patternCatalogDataSchema.parse(data);
  return assertValidCatalog(parsed, options);
}

export { DEFAULT_CATALOG_ROOT };
