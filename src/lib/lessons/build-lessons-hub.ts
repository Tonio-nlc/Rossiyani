import {
  getLessonBySlug,
  getManualStats,
  listLessonSummaries,
  type ManualLessonSummary,
} from "@/features/manual";
import { getManualLessonVisitCount } from "@/lib/manual/manual-lesson-history";

import { getFeaturedCollections, getGrammarCollections, getLevelCollections } from "./collections";

export type LessonsHubData = {
  stats: {
    totalLessons: number;
    visitedCount: number;
  };
  continueLesson: ManualLessonSummary | null;
  recommended: ManualLessonSummary[];
  popular: ManualLessonSummary[];
  foundations: ManualLessonSummary[];
  featuredCollections: ReturnType<typeof getFeaturedCollections>;
  levelCollections: ReturnType<typeof getLevelCollections>;
  grammarCollections: ReturnType<typeof getGrammarCollections>;
};

export function buildLessonsHubData(): LessonsHubData {
  const summaries = listLessonSummaries();
  const stats = getManualStats();

  const recommended = summaries
    .filter((lesson) => lesson.level === "a1" || lesson.level === "a2")
    .slice(0, 6);

  const popular = [...summaries]
    .sort((left, right) => right.difficulty - left.difficulty || left.title.localeCompare(right.title))
    .slice(0, 8);

  const foundations = summaries.filter((lesson) => lesson.level === "a1").slice(0, 6);

  return {
    stats: {
      totalLessons: stats.totalLessons,
      visitedCount: getManualLessonVisitCount(),
    },
    continueLesson: null,
    recommended,
    popular,
    foundations,
    featuredCollections: getFeaturedCollections(),
    levelCollections: getLevelCollections(),
    grammarCollections: getGrammarCollections(),
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
