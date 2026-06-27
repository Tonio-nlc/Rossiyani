import { getCollectionName, type CollectionId } from "@/content/collections";
import { estimateReadingMinutes, getTextDescription } from "@/components/library/library-utils";
import type { TextListItem } from "@/features/texts";
import { isDisplayableLibraryText } from "@/lib/home/displayable-text";
import {
  goalCollectionAffinity,
  learnerLevelToCefrTargets,
} from "@/lib/home/resolve-home-continue";
import { getLearnerProfile } from "@/lib/onboarding/profile";
import type { TextReadingProgress } from "@/lib/reader/reading-progress";

export type HomeJourneyCard = {
  id: string;
  title: string;
  description: string;
  collection: string;
  collectionId: CollectionId;
  level: string;
  estimatedMinutes: number;
  href: string;
  progressPercent: number;
};

function levelScore(textLevel: TextListItem["level"], targets: TextListItem["level"][]): number {
  const index = targets.indexOf(textLevel);
  if (index < 0) {
    return 20;
  }
  return 100 - index * 15;
}

function scoreJourneyText(
  text: TextListItem,
  readingProgress: Record<string, TextReadingProgress>,
  targets: TextListItem["level"][],
  goalCollection: CollectionId | null,
  dayBucket: number,
): number {
  const progress = readingProgress[text.id];
  const completed = progress?.percent === 100;
  const started = Boolean(progress && progress.wordsSeenIds.length > 0);
  const hash = (text.id.charCodeAt(0) + dayBucket) % 5;

  if (completed) {
    return 200 + hash;
  }

  let score = levelScore(text.level, targets) + hash;
  if (goalCollection && text.collectionId === goalCollection) {
    score -= 25;
  }
  if (started && (progress?.percent ?? 0) < 100) {
    score -= 40;
  }
  if (!started) {
    score -= 10;
  }
  return score;
}

export function pickHomeJourneyTexts(
  texts: TextListItem[],
  readingProgress: Record<string, TextReadingProgress>,
  excludeTextId: string | null = null,
  limit = 3,
): HomeJourneyCard[] {
  const profile = getLearnerProfile();
  const targets = learnerLevelToCefrTargets(profile.level);
  const goalCollection = goalCollectionAffinity(profile.goal);
  const dayBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

  const candidates = texts
    .filter(isDisplayableLibraryText)
    .filter((text) => text.id !== excludeTextId)
    .sort(
      (left, right) =>
        scoreJourneyText(left, readingProgress, targets, goalCollection, dayBucket) -
        scoreJourneyText(right, readingProgress, targets, goalCollection, dayBucket),
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
    if (!picked.some((item) => item.id === text.id)) {
      picked.push(text);
    }
  }

  return picked.slice(0, limit).map((text) => ({
    id: text.id,
    title: text.title,
    description: getTextDescription(text.collectionId),
    collection: getCollectionName(text.collectionId),
    collectionId: text.collectionId,
    level: text.level,
    estimatedMinutes: estimateReadingMinutes(text.sentenceCount),
    href: `/texts/${text.id}`,
    progressPercent: readingProgress[text.id]?.percent ?? 0,
  }));
}
