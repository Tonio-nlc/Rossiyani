import fs from "node:fs";
import path from "node:path";

import { MANUAL_CATEGORIES, MANUAL_CONTENT_ROOT, MANUAL_CURRICULUM_TARGETS } from "./constants";
import { parseLessonFile } from "./parse-lesson";
import type { ManualCategory, ManualLevel } from "./constants";
import type { ManualLesson, ManualLessonSummary } from "./types";

function resolveContentRoot(customRoot?: string): string {
  return path.join(process.cwd(), customRoot ?? MANUAL_CONTENT_ROOT);
}

function walkMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".md") &&
      !entry.name.startsWith("_")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function toSummary(lesson: ManualLesson): ManualLessonSummary {
  return {
    title: lesson.title,
    slug: lesson.slug,
    level: lesson.level,
    category: lesson.category,
    difficulty: lesson.difficulty,
    estimatedReadingTime: lesson.estimatedReadingTime,
    keywords: lesson.keywords,
  };
}

function sortLessons(a: ManualLessonSummary, b: ManualLessonSummary): number {
  const levelOrder = ["a1", "a2", "b1", "b2", "c1", "c2"];
  const levelDiff = levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
  if (levelDiff !== 0) {
    return levelDiff;
  }
  return a.title.localeCompare(b.title, "fr");
}

let cachedLessons: ManualLesson[] | null = null;

export function loadAllLessons(contentRoot?: string): ManualLesson[] {
  if (cachedLessons && !contentRoot) {
    return cachedLessons;
  }

  const root = resolveContentRoot(contentRoot);
  const files = walkMarkdownFiles(root);
  const lessons = files.map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    return parseLessonFile(raw, filePath);
  });

  const uniqueSlugs = new Set<string>();
  for (const lesson of lessons) {
    if (uniqueSlugs.has(lesson.slug)) {
      throw new Error(`Duplicate manual lesson slug: ${lesson.slug}`);
    }
    uniqueSlugs.add(lesson.slug);
  }

  const sorted = lessons.sort((a, b) => sortLessons(toSummary(a), toSummary(b)));

  if (!contentRoot) {
    cachedLessons = sorted;
  }

  return sorted;
}

export function listLessonSummaries(contentRoot?: string): ManualLessonSummary[] {
  return loadAllLessons(contentRoot).map(toSummary);
}

export function getLessonBySlug(slug: string, contentRoot?: string): ManualLesson | null {
  return loadAllLessons(contentRoot).find((lesson) => lesson.slug === slug) ?? null;
}

export function getLessonsByLevel(level: ManualLevel, contentRoot?: string): ManualLessonSummary[] {
  return listLessonSummaries(contentRoot)
    .filter((lesson) => lesson.level === level)
    .sort(sortLessons);
}

export function getLessonsByCategory(
  category: ManualCategory,
  contentRoot?: string,
): ManualLessonSummary[] {
  return listLessonSummaries(contentRoot)
    .filter((lesson) => lesson.category === category)
    .sort(sortLessons);
}

export function getManualStats(contentRoot?: string): {
  totalLessons: number;
  byLevel: Record<ManualLevel, number>;
  byCategory: Record<ManualCategory, number>;
} {
  const summaries = listLessonSummaries(contentRoot);
  const byLevel = Object.fromEntries(
    (["a1", "a2", "b1", "b2", "c1", "c2"] as ManualLevel[]).map((level) => [
      level,
      summaries.filter((lesson) => lesson.level === level).length,
    ]),
  ) as Record<ManualLevel, number>;

  const byCategory = Object.fromEntries(
    MANUAL_CATEGORIES.map((category) => [
      category,
      summaries.filter((lesson) => lesson.category === category).length,
    ]),
  ) as Record<ManualCategory, number>;

  return {
    totalLessons: summaries.length,
    byLevel,
    byCategory,
  };
}

export function getManualCurriculum(contentRoot?: string): Array<{
  category: ManualCategory;
  published: number;
  target: number;
  percent: number;
}> {
  const stats = getManualStats(contentRoot);

  return MANUAL_CATEGORIES.map((category) => {
    const published = stats.byCategory[category];
    const target = MANUAL_CURRICULUM_TARGETS[category];
    return {
      category,
      published,
      target,
      percent: Math.min(100, Math.round((published / target) * 100)),
    };
  });
}

/** Test helper — clears in-memory cache. */
export function clearManualLessonCache(): void {
  cachedLessons = null;
}
