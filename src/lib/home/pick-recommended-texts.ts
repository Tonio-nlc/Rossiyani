import { getCollectionName } from "@/content/collections";
import { estimateReadingMinutes } from "@/components/library/library-utils";
import type { TextListItem } from "@/features/texts";
import { isDisplayableLibraryText } from "@/lib/home/displayable-text";
import type { TextReadingProgress } from "@/lib/reader/reading-progress";

export type RecommendedTextCard = {
  id: string;
  title: string;
  collection: string;
  collectionId: TextListItem["collectionId"];
  level: string;
  estimatedMinutes: number;
  href: string;
};

function scoreText(
  text: TextListItem,
  readingProgress: Record<string, TextReadingProgress>,
  dayBucket: number,
): number {
  const progress = readingProgress[text.id];
  const completed = progress?.percent === 100;
  const started = Boolean(progress && progress.wordsSeenIds.length > 0);
  const hash = (text.id.charCodeAt(0) + dayBucket) % 7;

  if (completed) {
    return 100 + hash;
  }
  if (!started) {
    return hash;
  }
  return 40 + (progress?.percent ?? 0) + hash;
}

export function pickRecommendedTexts(
  texts: TextListItem[],
  readingProgress: Record<string, TextReadingProgress>,
  excludeTextId: string | null = null,
  limit = 3,
): RecommendedTextCard[] {
  const dayBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const candidates = texts
    .filter(isDisplayableLibraryText)
    .filter((text) => text.id !== excludeTextId)
    .sort(
      (left, right) =>
        scoreText(left, readingProgress, dayBucket) - scoreText(right, readingProgress, dayBucket),
    );

  const seenCollections = new Set<string>();
  const picked: TextListItem[] = [];

  for (const text of candidates) {
    if (picked.length >= limit) {
      break;
    }
    if (seenCollections.has(text.collectionId) && picked.length < limit - 1) {
      continue;
    }
    seenCollections.add(text.collectionId);
    picked.push(text);
  }

  for (const text of candidates) {
    if (picked.length >= limit) {
      break;
    }
    if (picked.some((item) => item.id === text.id)) {
      continue;
    }
    picked.push(text);
  }

  return picked.map((text) => ({
    id: text.id,
    title: text.title,
    collection: getCollectionName(text.collectionId),
    collectionId: text.collectionId,
    level: text.level,
    estimatedMinutes: estimateReadingMinutes(text.sentenceCount),
    href: `/texts/${text.id}`,
  }));
}
