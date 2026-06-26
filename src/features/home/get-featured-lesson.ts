import { cookies, headers } from "next/headers";

import type { CefrLevel, FeaturedCandidateType } from "@prisma/client";

import {
  DAILY_FEATURED_LESSON_COOKIE,
  LEARNER_ID_COOKIE,
  LEARNER_ID_HEADER,
} from "@/features/discovery/cookies";
import { discoverySeed, getDateKey, seededIndex } from "@/features/discovery/discovery-seed";
import type { LearningSignals, TodaysDiscovery } from "@/features/discovery/types";
import {
  getLessonBySlug,
  listLessonSummaries,
  MANUAL_CATEGORY_LABELS,
} from "@/features/manual";
import type { ManualCategory, ManualLessonSummary, ManualLevel } from "@/features/manual";

export type HomeFeaturedLesson = {
  slug: string;
  title: string;
  description: string;
  readingMinutes: number;
  levelLabel: string;
  href: string;
  dateKey: string;
};

type DailyFeaturedLessonCache = {
  dateKey: string;
  lessonSlug: string;
  learnerId: string;
};

/** Absolute fallback slugs — tried in order when personalization is unavailable. */
const GLOBAL_FALLBACK_SLUGS = [
  "accent-tonique",
  "alphabet-cyrillique",
  "verbes-essentiels",
] as const;

const DISCOVERY_TYPE_CATEGORIES: Partial<Record<FeaturedCandidateType, ManualCategory[]>> = {
  GRAMMAR: ["syntax", "declensions", "aspect", "prepositions"],
  CONSTRUCTION: ["syntax", "expressions"],
  WORD: ["verbs", "expressions", "communication"],
  COLLOCATION: ["expressions", "syntax"],
  EXPRESSION: ["expressions", "communication"],
  CONVERSATION: ["communication", "expressions"],
  NATIVE_PHRASE: ["expressions", "register"],
  SLANG: ["expressions", "register", "culture"],
  REGIONAL: ["culture", "expressions"],
};

const DISCOVERY_TOPIC_CATEGORIES: Record<string, ManualCategory[]> = {
  contrast: ["syntax", "expressions"],
  grammar: ["syntax", "declensions", "aspect"],
  conversation: ["communication", "expressions"],
  purpose: ["syntax", "verbs"],
  motion: ["motion-verbs", "verbs"],
};

const STATIC_LESSONS_FALLBACK: HomeFeaturedLesson = {
  slug: "lessons",
  title: "Leçons Rossiyani",
  description: "Parcours structuré de leçons de russe, du A1 au C1.",
  readingMinutes: 10,
  levelLabel: "A1",
  href: "/lessons",
  dateKey: getDateKey(),
};

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase();
}

function cefrToManualLevel(cefr: CefrLevel): ManualLevel {
  switch (cefr) {
    case "A1":
      return "a1";
    case "A2":
      return "a2";
    case "B1":
      return "b1";
    case "B2":
      return "b2";
    case "C1":
      return "c1";
    case "Native":
      return "c2";
    default:
      return "b1";
  }
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

function toFeaturedLesson(summary: ManualLessonSummary, dateKey: string): HomeFeaturedLesson {
  const full = getLessonBySlug(summary.slug);
  const categoryLabel = MANUAL_CATEGORY_LABELS[summary.category];

  return {
    slug: summary.slug,
    title: summary.title,
    description: full
      ? extractLessonDescription(full.content, categoryLabel)
      : categoryLabel,
    readingMinutes: summary.estimatedReadingTime,
    levelLabel: summary.level.toUpperCase(),
    href: `/lessons/lecons/${summary.slug}`,
    dateKey,
  };
}

function parseFeaturedLessonCache(raw: string | undefined): DailyFeaturedLessonCache | null {
  if (!raw) {
    return null;
  }

  try {
    const decoded = raw.startsWith("%7B") || raw.startsWith("%") ? decodeURIComponent(raw) : raw;
    const parsed = JSON.parse(decoded) as Partial<DailyFeaturedLessonCache>;
    if (
      typeof parsed.dateKey === "string" &&
      typeof parsed.lessonSlug === "string" &&
      typeof parsed.learnerId === "string"
    ) {
      return parsed as DailyFeaturedLessonCache;
    }
    return null;
  } catch {
    return null;
  }
}

async function readLearnerId(): Promise<string | null> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  return (
    cookieStore.get(LEARNER_ID_COOKIE)?.value ?? headerStore.get(LEARNER_ID_HEADER) ?? null
  );
}

async function readCachedFeaturedLesson(
  dateKey: string,
  learnerId: string | null,
): Promise<string | null> {
  if (!learnerId) {
    return null;
  }

  const cookieStore = await cookies();
  const cached = parseFeaturedLessonCache(
    cookieStore.get(DAILY_FEATURED_LESSON_COOKIE)?.value,
  );

  if (
    cached &&
    cached.dateKey === dateKey &&
    cached.learnerId === learnerId
  ) {
    return cached.lessonSlug;
  }

  return null;
}

function scoreDiscoveryMatch(lesson: ManualLessonSummary, discovery: TodaysDiscovery): number {
  const lemma = normalizeLabel(discovery.displayLabel);
  const topics = discovery.topics.map(normalizeLabel);
  let score = 0;

  for (const keyword of lesson.keywords) {
    const normalized = normalizeLabel(keyword);
    if (normalized === lemma) {
      score += 120;
    } else if (normalized.includes(lemma) || lemma.includes(normalized)) {
      score += 60;
    }
  }

  const slugLemma = lesson.slug.replace(/-/g, " ");
  if (slugLemma.includes(lemma) || lemma.includes(slugLemma)) {
    score += 50;
  }

  const preferredCategories = DISCOVERY_TYPE_CATEGORIES[discovery.type] ?? [];
  if (preferredCategories.includes(lesson.category)) {
    score += 40;
  }

  for (const topic of topics) {
    const categories = DISCOVERY_TOPIC_CATEGORIES[topic] ?? [];
    if (categories.includes(lesson.category)) {
      score += 25;
    }
    if (lesson.keywords.some((keyword) => normalizeLabel(keyword).includes(topic))) {
      score += 15;
    }
  }

  if (lesson.level === cefrToManualLevel(discovery.difficulty)) {
    score += 30;
  }

  return score;
}

function pickPersonalizedFromDiscovery(
  summaries: ManualLessonSummary[],
  discovery: TodaysDiscovery,
  learnerId: string,
  dateKey: string,
): ManualLessonSummary | null {
  const scored = summaries
    .map((lesson) => ({ lesson, score: scoreDiscoveryMatch(lesson, discovery) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.lesson.slug.localeCompare(right.lesson.slug);
    });

  if (scored.length === 0) {
    return null;
  }

  const topScore = scored[0]!.score;
  const tieBand = scored.filter((entry) => entry.score >= topScore - 5).map((entry) => entry.lesson);
  const seed = discoverySeed(`${learnerId}:featured-lesson:discovery:${discovery.id}`, dateKey);
  return tieBand[seededIndex(seed, tieBand.length)] ?? scored[0]!.lesson;
}

function pickContinueLearningLesson(
  summaries: ManualLessonSummary[],
  signals: LearningSignals,
  learnerId: string,
  dateKey: string,
): ManualLessonSummary | null {
  const recentSlugs = signals.recentManualLessonSlugs;
  if (recentSlugs.length === 0) {
    return null;
  }

  const lastSlug = recentSlugs[0]!;
  const lastLesson = summaries.find((lesson) => lesson.slug === lastSlug);
  if (!lastLesson) {
    return null;
  }

  const sameCategory = summaries.filter(
    (lesson) => lesson.category === lastLesson.category && lesson.slug !== lastSlug,
  );
  if (sameCategory.length === 0) {
    return null;
  }

  sameCategory.sort((left, right) => left.slug.localeCompare(right.slug));
  const seed = discoverySeed(`${learnerId}:featured-lesson:continue:${lastSlug}`, dateKey);
  return sameCategory[seededIndex(seed, sameCategory.length)] ?? null;
}

function pickDailyDeterministicLesson(
  summaries: ManualLessonSummary[],
  learnerId: string,
  dateKey: string,
): ManualLessonSummary {
  const sorted = [...summaries].sort((left, right) => left.slug.localeCompare(right.slug));
  const seed = discoverySeed(learnerId, dateKey);
  return sorted[seededIndex(seed, sorted.length)]!;
}

function pickGlobalFallback(summaries: ManualLessonSummary[]): ManualLessonSummary | null {
  for (const slug of GLOBAL_FALLBACK_SLUGS) {
    const lesson = summaries.find((entry) => entry.slug === slug);
    if (lesson) {
      return lesson;
    }
  }
  return summaries[0] ?? null;
}

function resolveSummary(
  summaries: ManualLessonSummary[],
  slug: string,
): ManualLessonSummary | null {
  return summaries.find((lesson) => lesson.slug === slug) ?? null;
}

function selectFeaturedSummary(
  summaries: ManualLessonSummary[],
  todaysDiscovery: TodaysDiscovery | null,
  signals: LearningSignals,
  learnerId: string,
  dateKey: string,
): ManualLessonSummary {
  if (todaysDiscovery) {
    const personalized = pickPersonalizedFromDiscovery(
      summaries,
      todaysDiscovery,
      learnerId,
      dateKey,
    );
    if (personalized) {
      return personalized;
    }
  }

  const continued = pickContinueLearningLesson(summaries, signals, learnerId, dateKey);
  if (continued) {
    return continued;
  }

  return pickDailyDeterministicLesson(summaries, learnerId, dateKey);
}

export type GetFeaturedLessonInput = {
  todaysDiscovery: TodaysDiscovery | null;
  signals: LearningSignals;
};

/**
 * Resolves the homepage featured lesson using the same resilience model as Today's Discovery:
 * personalized → continue learning → daily deterministic → global fallback → static manual link.
 */
export async function getFeaturedLesson(input: GetFeaturedLessonInput): Promise<HomeFeaturedLesson> {
  const dateKey = getDateKey();
  const learnerId = (await readLearnerId()) ?? "anonymous";
  const summaries = listLessonSummaries();

  if (summaries.length === 0) {
    return { ...STATIC_LESSONS_FALLBACK, dateKey };
  }

  const cachedSlug = await readCachedFeaturedLesson(dateKey, learnerId);
  if (cachedSlug) {
    const cachedLesson = resolveSummary(summaries, cachedSlug);
    if (cachedLesson) {
      return toFeaturedLesson(cachedLesson, dateKey);
    }
  }

  const selected =
    selectFeaturedSummary(summaries, input.todaysDiscovery, input.signals, learnerId, dateKey) ??
    pickGlobalFallback(summaries);

  if (!selected) {
    return { ...STATIC_LESSONS_FALLBACK, dateKey };
  }

  return toFeaturedLesson(selected, dateKey);
}
