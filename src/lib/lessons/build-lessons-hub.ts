import {
  getLessonBySlug,
  getManualStats,
  listLessonSummaries,
  type ManualLessonSummary,
} from "@/features/manual";
import { getManualLessonVisitCount } from "@/lib/manual/manual-lesson-history";

import { getHomepageCollections, getLevelCollections } from "./collections";

/** Diverse starters — one per learning angle, never duplicated on the homepage. */
const DISCOVER_SLUGS = [
  "alphabet-cyrillique",
  "accent-tonique",
  "verbes-essentiels",
  "prepositions-v-na",
] as const;

export type LessonsHubData = {
  stats: {
    totalLessons: number;
    visitedCount: number;
  };
  collections: ReturnType<typeof getHomepageCollections>;
  levelCollections: ReturnType<typeof getLevelCollections>;
  /** Max 4 curated lessons — only section that lists individual lessons besides Reprendre. */
  discoverLessons: ManualLessonSummary[];
};

function toSummaryList(slugs: readonly string[]): ManualLessonSummary[] {
  const summaries = listLessonSummaries();
  const seen = new Set<string>();

  return slugs
    .map((slug) => summaries.find((lesson) => lesson.slug === slug) ?? getLessonBySlug(slug))
    .filter((lesson): lesson is NonNullable<typeof lesson> => lesson !== null)
    .map((lesson) => ({
      title: lesson.title,
      slug: lesson.slug,
      level: lesson.level,
      category: lesson.category,
      difficulty: lesson.difficulty,
      estimatedReadingTime: lesson.estimatedReadingTime,
      keywords: lesson.keywords,
    }))
    .filter((lesson) => {
      if (seen.has(lesson.slug)) {
        return false;
      }
      seen.add(lesson.slug);
      return true;
    });
}

export function buildLessonsHubData(): LessonsHubData {
  const stats = getManualStats();

  return {
    stats: {
      totalLessons: stats.totalLessons,
      visitedCount: getManualLessonVisitCount(),
    },
    collections: getHomepageCollections(),
    levelCollections: getLevelCollections(),
    discoverLessons: toSummaryList(DISCOVER_SLUGS).slice(0, 4),
  };
}

export function getNextLessonInPath(current: ManualLessonSummary): ManualLessonSummary | null {
  const summaries = listLessonSummaries();
  const index = summaries.findIndex((lesson) => lesson.slug === current.slug);
  if (index === -1 || index >= summaries.length - 1) {
    return null;
  }
  return summaries[index + 1] ?? null;
}

export function resolveLessonSummaries(slugs: string[]): ManualLessonSummary[] {
  return slugs
    .map((slug) => getLessonBySlug(slug))
    .filter((lesson): lesson is NonNullable<typeof lesson> => lesson !== null)
    .map((lesson) => ({
      title: lesson.title,
      slug: lesson.slug,
      level: lesson.level,
      category: lesson.category,
      difficulty: lesson.difficulty,
      estimatedReadingTime: lesson.estimatedReadingTime,
      keywords: lesson.keywords,
    }));
}
