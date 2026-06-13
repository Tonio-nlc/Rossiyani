import {
  getLessonBySlug,
  listLessonSummaries,
  MANUAL_CATEGORY_LABELS,
} from "@/features/manual";

import { lemmaPath } from "@/components/explorer/explorer-routes";
import { getTodaysDiscovery } from "@/features/discovery";
import type { TodaysDiscovery } from "@/features/discovery";
import { prisma } from "@/lib/prisma";

export type HomeReviewWord = {
  label: string;
  href: string;
};

export type HomeReviewToday = {
  words: HomeReviewWord[];
  totalCount: number;
};

export type HomeFeaturedLesson = {
  title: string;
  description: string;
  readingMinutes: number;
  levelLabel: string;
  href: string;
};

export type HomeJournalData = {
  hasImportedTexts: boolean;
  todaysDiscovery: TodaysDiscovery | null;
  review: HomeReviewToday;
  featuredLesson: HomeFeaturedLesson | null;
  srsHref: string;
};

/** Curated lessons surfaced on the homepage — rotated daily. */
const FEATURED_LESSON_SLUGS = [
  "accent-deplacement",
  "motion-ezdit-vs-exhat",
  "aspect-paires-courantes",
  "cuisine-maison",
  "accent-tonique",
  "genitif-negation",
  "register-vy-debutant",
  "expressions-konechno",
] as const;

function extractLessonDescription(content: string, categoryLabel: string): string {
  const blocks = content
    .split("\n\n")
    .map((block) => block.trim())
    .filter(
      (block) =>
        block.length > 0 &&
        !block.startsWith("---") &&
        !block.startsWith("#") &&
        !block.startsWith("────────────────"),
    );

  const first = blocks[0]?.replace(/\*\*/g, "").replace(/\*/g, "").trim();
  if (first && first.length > 20) {
    return first.length > 140 ? `${first.slice(0, 137)}…` : first;
  }

  return categoryLabel;
}

function pickFeaturedLesson(dayBucket: number): HomeFeaturedLesson | null {
  const summaries = listLessonSummaries();
  if (summaries.length === 0) {
    return null;
  }

  const curated = FEATURED_LESSON_SLUGS.map((slug) => summaries.find((lesson) => lesson.slug === slug))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));

  const pool = curated.length > 0 ? curated : summaries;
  const picked = pool[dayBucket % pool.length]!;
  const full = getLessonBySlug(picked.slug);
  const categoryLabel = MANUAL_CATEGORY_LABELS[picked.category];

  return {
    title: picked.title,
    description: full
      ? extractLessonDescription(full.content, categoryLabel)
      : categoryLabel,
    readingMinutes: picked.estimatedReadingTime,
    levelLabel: picked.level.toUpperCase(),
    href: `/manual/lecons/${picked.slug}`,
  };
}

export async function getHomeJournalData(textCount: number): Promise<HomeJournalData> {
  const dayBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

  const [todaysDiscovery, lemmaPool] = await Promise.all([
    getTodaysDiscovery(),
    prisma.knowledgeLemma.findMany({
      where: { occurrenceCount: { gt: 0 } },
      orderBy: { occurrenceCount: "desc" },
      take: 40,
      select: { lemma: true, partOfSpeech: true },
    }),
  ]);

  const reviewStart = dayBucket % Math.max(1, lemmaPool.length - 5);
  const reviewLemmas = lemmaPool.slice(reviewStart, reviewStart + 5);
  const reviewWords: HomeReviewWord[] = reviewLemmas.map((item) => ({
    label: item.lemma.toUpperCase(),
    href: lemmaPath(item.lemma, item.partOfSpeech),
  }));

  return {
    hasImportedTexts: textCount > 0,
    todaysDiscovery,
    review: {
      words: reviewWords,
      totalCount: lemmaPool.length,
    },
    featuredLesson: pickFeaturedLesson(dayBucket),
    srsHref: "/explorer/lemmas",
  };
}
