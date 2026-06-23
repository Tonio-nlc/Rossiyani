import { getCollectionRecord, type CollectionId } from "@/content/collections";
import type { TextListItem } from "@/features/texts";
import { isDisplayableLibraryText } from "@/lib/home/displayable-text";
import type { TextReadingProgress } from "@/lib/reader/reading-progress";

export type FeaturedCollectionFeature = {
  id: CollectionId;
  name: string;
  description: string;
  level: string | null;
  textCount: number;
  continueHref: string;
  viewHref: string;
};

function dominantLevel(texts: TextListItem[]): string | null {
  if (texts.length === 0) {
    return null;
  }
  const counts = new Map<string, number>();
  for (const text of texts) {
    counts.set(text.level, (counts.get(text.level) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function pickCollectionId(
  texts: TextListItem[],
  preferredId: CollectionId | null,
): CollectionId {
  if (preferredId && texts.some((text) => text.collectionId === preferredId)) {
    return preferredId;
  }

  const counts = new Map<CollectionId, number>();
  for (const text of texts) {
    if (!isDisplayableLibraryText(text)) {
      continue;
    }
    counts.set(text.collectionId, (counts.get(text.collectionId) ?? 0) + 1);
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked[0]?.[0]) {
    return ranked[0][0];
  }

  return "everyday-russian";
}

function continueHrefForCollection(
  collectionTexts: TextListItem[],
  readingProgress: Record<string, TextReadingProgress>,
): string {
  const inProgress = collectionTexts.find((text) => {
    const progress = readingProgress[text.id];
    return progress && progress.percent > 0 && progress.percent < 100;
  });
  if (inProgress) {
    return `/texts/${inProgress.id}`;
  }

  const notStarted = collectionTexts.find((text) => {
    const progress = readingProgress[text.id];
    return !progress || progress.wordsSeenIds.length === 0;
  });
  if (notStarted) {
    return `/texts/${notStarted.id}`;
  }

  return collectionTexts[0] ? `/texts/${collectionTexts[0].id}` : "/library";
}

export function pickFeaturedCollection(
  texts: TextListItem[],
  readingProgress: Record<string, TextReadingProgress>,
  preferredCollectionId: CollectionId | null = null,
): FeaturedCollectionFeature {
  const displayable = texts.filter(isDisplayableLibraryText);
  const id = pickCollectionId(displayable, preferredCollectionId);
  const collection = getCollectionRecord(id);
  const collectionTexts = displayable.filter((text) => text.collectionId === id);

  return {
    id,
    name: collection.name,
    description: collection.description,
    level: dominantLevel(collectionTexts),
    textCount: collectionTexts.length,
    continueHref: continueHrefForCollection(collectionTexts, readingProgress),
    viewHref: "/library",
  };
}
