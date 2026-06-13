import { lemmaPath } from "@/components/explorer/explorer-routes";
import { getDateKey } from "@/features/discovery/discovery-seed";
import { getTodaysDiscovery } from "@/features/discovery";
import type { TodaysDiscovery } from "@/features/discovery";
import { getLearnerContext } from "@/features/discovery/get-learner-context";
import { prisma } from "@/lib/prisma";

import { pickFeaturedLesson } from "./pick-featured-lesson";
import type { HomeFeaturedLesson } from "./pick-featured-lesson";
import { pickFeaturedPractice } from "./pick-featured-practice";
import type { HomeFeaturedPractice } from "./pick-featured-practice";

export type { HomeFeaturedPractice } from "./pick-featured-practice";

export type HomeReviewWord = {
  label: string;
  href: string;
  count?: number;
};

export type HomeReviewToday = {
  words: HomeReviewWord[];
  moreCount: number;
};

export type { HomeFeaturedLesson } from "./pick-featured-lesson";

export type HomeJournalData = {
  todaysDiscovery: TodaysDiscovery | null;
  review: HomeReviewToday;
  featuredLesson: HomeFeaturedLesson;
  featuredPractice: HomeFeaturedPractice;
  reviewHref: string;
};

function reviewCountForLemma(lemma: string, index: number): number | undefined {
  const hash = lemma.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const count = (hash + index) % 4;
  return count > 1 ? count : undefined;
}

export async function getHomeJournalData(): Promise<HomeJournalData> {
  const dateKey = getDateKey();

  const [todaysDiscovery, lemmaPool, { signals }] = await Promise.all([
    getTodaysDiscovery(),
    prisma.knowledgeLemma.findMany({
      where: { occurrenceCount: { gt: 0 } },
      orderBy: { occurrenceCount: "desc" },
      take: 40,
      select: { lemma: true, partOfSpeech: true },
    }),
    getLearnerContext(dateKey),
  ]);

  const reviewStart =
    Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % Math.max(1, lemmaPool.length - 5);
  const reviewLemmas = lemmaPool.slice(reviewStart, reviewStart + 5);
  const reviewWords: HomeReviewWord[] = reviewLemmas.map((item, index) => ({
    label: item.lemma.toUpperCase(),
    href: lemmaPath(item.lemma, item.partOfSpeech),
    count: reviewCountForLemma(item.lemma, index),
  }));

  const featuredPractice = await pickFeaturedPractice({
    todaysDiscovery,
    signals,
    reviewLemmas: reviewLemmas.map((item) => item.lemma),
  });

  return {
    todaysDiscovery,
    review: {
      words: reviewWords,
      moreCount: Math.max(0, lemmaPool.length - reviewWords.length),
    },
    featuredLesson: pickFeaturedLesson(todaysDiscovery),
    featuredPractice,
    reviewHref: "/explorer/lemmas",
  };
}
