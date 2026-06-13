import {
  getLessonBySlug,
  listLessonSummaries,
  MANUAL_CATEGORY_LABELS,
} from "@/features/manual";

import type { TodaysDiscovery } from "@/features/discovery";

export type HomeFeaturedLesson = {
  title: string;
  description: string;
  readingMinutes: number;
  levelLabel: string;
  href: string;
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
  "syntax-nesmotrya-na",
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

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase();
}

function findDiscoveryLinkedLesson(
  summaries: ReturnType<typeof listLessonSummaries>,
  discovery: TodaysDiscovery,
): ReturnType<typeof listLessonSummaries>[number] | null {
  const lemma = normalizeLabel(discovery.displayLabel);
  const topics = new Set(discovery.topics.map(normalizeLabel));

  const keywordMatch = summaries.find((lesson) =>
    lesson.keywords.some((keyword) => {
      const normalized = normalizeLabel(keyword);
      return normalized === lemma || normalized.includes(lemma) || lemma.includes(normalized);
    }),
  );
  if (keywordMatch) {
    return keywordMatch;
  }

  const topicMatch = summaries.find((lesson) =>
    lesson.keywords.some((keyword) => topics.has(normalizeLabel(keyword))),
  );
  if (topicMatch) {
    return topicMatch;
  }

  const slugMatch = summaries.find((lesson) => {
    const slugLemma = lesson.slug.replace(/-/g, " ");
    return slugLemma.includes(lemma) || lemma.includes(slugLemma);
  });
  if (slugMatch) {
    return slugMatch;
  }

  return null;
}

/**
 * Picks the homepage featured lesson:
 * 1. Editor-picked (daily rotation among curated slugs)
 * 2. Lesson linked to Today's Discovery
 * 3. First available lesson
 */
export function pickFeaturedLesson(discovery: TodaysDiscovery | null): HomeFeaturedLesson {
  const summaries = listLessonSummaries();
  if (summaries.length === 0) {
    throw new Error("No manual lessons available for homepage featured lesson.");
  }

  const dayBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const editorPool = FEATURED_LESSON_SLUGS.map((slug) => summaries.find((lesson) => lesson.slug === slug))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));

  if (editorPool.length > 0) {
    return toFeaturedLesson(editorPool[dayBucket % editorPool.length]!);
  }

  if (discovery) {
    const linked = findDiscoveryLinkedLesson(summaries, discovery);
    if (linked) {
      return toFeaturedLesson(linked);
    }
  }

  return toFeaturedLesson(summaries[0]!);
}
