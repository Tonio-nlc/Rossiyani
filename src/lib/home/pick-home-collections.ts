import { getCollectionRecord, type CollectionId } from "@/content/collections";
import type { TextListItem } from "@/features/texts";
import { goalCollectionAffinity } from "@/lib/home/resolve-home-continue";
import { getLearnerProfile } from "@/lib/onboarding/profile";
import type { TextReadingProgress } from "@/lib/reader/reading-progress";

export type HomeCollectionHighlight = {
  id: CollectionId;
  title: string;
  description: string;
  href: string;
  level: TextListItem["level"] | null;
  textCount: number;
  startedCount: number;
  reason: string;
};

function dominantLevel(texts: TextListItem[]): TextListItem["level"] | null {
  if (texts.length === 0) {
    return null;
  }
  const order: TextListItem["level"][] = ["A1", "A2", "B1", "B2", "C1", "Native"];
  const counts = new Map<TextListItem["level"], number>();
  for (const text of texts) {
    counts.set(text.level, (counts.get(text.level) ?? 0) + 1);
  }
  let best: TextListItem["level"] = texts[0]!.level;
  let bestCount = 0;
  for (const level of order) {
    const count = counts.get(level) ?? 0;
    if (count > bestCount) {
      best = level;
      bestCount = count;
    }
  }
  return best;
}

function startedTextsInCollection(
  collectionId: CollectionId,
  texts: TextListItem[],
  readingProgress: Record<string, TextReadingProgress>,
): number {
  return texts.filter(
    (text) =>
      text.collectionId === collectionId &&
      (readingProgress[text.id]?.wordsSeenIds.length ?? 0) > 0,
  ).length;
}

export function pickHomeCollectionHighlights(
  texts: TextListItem[],
  readingProgress: Record<string, TextReadingProgress>,
  limit = 3,
): HomeCollectionHighlight[] {
  const profile = getLearnerProfile();
  const goalCollection = goalCollectionAffinity(profile.goal);
  const picked = new Set<CollectionId>();
  const highlights: HomeCollectionHighlight[] = [];

  const addCollection = (id: CollectionId, reason: string) => {
    if (picked.has(id) || highlights.length >= limit) {
      return;
    }
    const collectionTexts = texts.filter((text) => text.collectionId === id);
    if (collectionTexts.length === 0) {
      return;
    }
    const collection = getCollectionRecord(id);
    picked.add(id);
    highlights.push({
      id,
      title: collection.name,
      description: collection.description,
      href: `/library?collection=${id}`,
      level: dominantLevel(collectionTexts),
      textCount: collectionTexts.length,
      startedCount: startedTextsInCollection(id, texts, readingProgress),
      reason,
    });
  };

  const inProgressCollections = new Map<CollectionId, number>();
  for (const text of texts) {
    const progress = readingProgress[text.id];
    if (progress && progress.wordsSeenIds.length > 0 && progress.percent < 100) {
      inProgressCollections.set(
        text.collectionId,
        (inProgressCollections.get(text.collectionId) ?? 0) + 1,
      );
    }
  }

  const sortedInProgress = [...inProgressCollections.entries()].sort((a, b) => b[1] - a[1]);
  for (const [collectionId] of sortedInProgress) {
    addCollection(collectionId, "Reprendre une collection commencée");
    if (highlights.length >= limit) {
      return highlights;
    }
  }

  if (goalCollection) {
    addCollection(goalCollection, "Adaptée à votre objectif");
  }

  addCollection("everyday-russian", "Idéal pour débuter");
  addCollection("stories", "Pour progresser en contexte");

  for (const text of texts) {
    if (highlights.length >= limit) {
      break;
    }
    addCollection(text.collectionId, "Découverte éditoriale");
  }

  return highlights.slice(0, limit);
}
