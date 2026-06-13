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
  count?: number;
};

export type HomeReviewToday = {
  words: HomeReviewWord[];
  moreCount: number;
};

export type HomeFeaturedLesson = {
  title: string;
  description: string;
  readingMinutes: number;
  levelLabel: string;
  href: string;
};

export type HomeJournalData = {
  todaysDiscovery: TodaysDiscovery | null;
  review: HomeReviewToday;
  featuredLesson: HomeFeaturedLesson | null;
  reviewHref: string;
};

/** Editor-picked lessons for the homepage featured card. */
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

function reviewCountForLemma(lemma: string, index: number): number | undefined {
  const hash = lemma.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const count = (hash + index) % 4;
  return count > 1 ? count : undefined;
}

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

function toFeaturedLesson(summary: ReturnType<typeof listLessonSummaries>[number]): HomeFeaturedLesson {
  const full = getLessonBySlug(summary.slug);
  const categoryLabel = MANUAL_CATEGORY_LABELS[summary.category];

  return {
    title: summary.title,
    description: full
      ? extractLessonDescription(full.content, categoryLabel)
      : categoryLabel,
    readingMinutes: summary.estimatedReadingTime,
    levelLabel: summary.level.toUpperCase(),
    href: `/manual/lecons/${summary.slug}`,
  };
}

function pickFeaturedLesson(): HomeFeaturedLesson | null {
  const summaries = listLessonSummaries();
  if (summaries.length === 0) {
    return null;
  }

  for (const slug of FEATURED_LESSON_SLUGS) {
    const editorPick = summaries.find((lesson) => lesson.slug === slug);
    if (editorPick) {
      return toFeaturedLesson(editorPick);
    }
  }

  const popular = [...summaries].sort((left, right) => {
    if (right.keywords.length !== left.keywords.length) {
      return right.keywords.length - left.keywords.length;
    }
    return left.difficulty - right.difficulty;
  })[0]!;

  return toFeaturedLesson(popular);
}

export async function getHomeJournalData(): Promise<HomeJournalData> {
  const [todaysDiscovery, lemmaPool] = await Promise.all([
    getTodaysDiscovery(),
    prisma.knowledgeLemma.findMany({
      where: { occurrenceCount: { gt: 0 } },
      orderBy: { occurrenceCount: "desc" },
      take: 40,
      select: { lemma: true, partOfSpeech: true },
    }),
  ]);

  const reviewStart =
    Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % Math.max(1, lemmaPool.length - 5);
  const reviewLemmas = lemmaPool.slice(reviewStart, reviewStart + 5);
  const reviewWords: HomeReviewWord[] = reviewLemmas.map((item, index) => ({
    label: item.lemma.toUpperCase(),
    href: lemmaPath(item.lemma, item.partOfSpeech),
    count: reviewCountForLemma(item.lemma, index),
  }));

  return {
    todaysDiscovery,
    review: {
      words: reviewWords,
      moreCount: Math.max(0, lemmaPool.length - reviewWords.length),
    },
    featuredLesson: pickFeaturedLesson(),
    reviewHref: "/explorer/lemmas",
  };
}
