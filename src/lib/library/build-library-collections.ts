import { estimateReadingMinutes } from "@/components/library/library-utils";
import {
  getAllCollections,
  getCollectionRecord,
  type CollectionId,
} from "@/content/collections";
import type { TextListItem } from "@/features/texts";
import { isDisplayableLibraryText } from "@/lib/home/displayable-text";
import type { ExplorationEntry } from "@/lib/explorer/exploration-history";
import type { TextReadingProgress } from "@/lib/reader/reading-progress";
import type { CefrLevel } from "@/types";

export type LibraryCollectionLayout = "featured" | "landscape" | "medium" | "compact";

export type LibraryCollectionSummary = {
  id: CollectionId;
  name: string;
  russianTitle: string;
  description: string;
  level: CefrLevel | null;
  textCount: number;
  readingMinutesTotal: number;
  averageReadingMinutes: number;
  wordsDiscovered: number;
  conceptsExplored: number;
  progressPercent: number;
  continueHref: string;
  layout: LibraryCollectionLayout;
};

const RUSSIAN_TITLES: Record<CollectionId, string> = {
  "everyday-russian": "Повседневный русский",
  stories: "Русские рассказы",
  telegram: "Телеграм",
  "slow-news": "Медленные новости",
  dialogues: "Диалоги",
  "travel-russian": "Русский для путешествий",
  culture: "Русская культура",
};

const LAYOUT_CYCLE: LibraryCollectionLayout[] = [
  "featured",
  "landscape",
  "medium",
  "compact",
  "landscape",
  "medium",
  "compact",
];

function dominantLevel(texts: TextListItem[]): CefrLevel | null {
  if (texts.length === 0) {
    return null;
  }
  const order: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "Native"];
  const counts = new Map<CefrLevel, number>();
  for (const text of texts) {
    counts.set(text.level, (counts.get(text.level) ?? 0) + 1);
  }
  let best: CefrLevel = texts[0]!.level;
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

function collectionProgressPercent(
  collectionTexts: TextListItem[],
  readingProgress: Record<string, TextReadingProgress>,
): number {
  if (collectionTexts.length === 0) {
    return 0;
  }
  const total = collectionTexts.reduce((sum, text) => {
    return sum + (readingProgress[text.id]?.percent ?? 0);
  }, 0);
  return Math.round(total / collectionTexts.length);
}

function conceptsForCollection(
  collectionTexts: TextListItem[],
  exploration: ExplorationEntry[],
): number {
  const textIds = new Set(collectionTexts.map((text) => text.id));
  const labels = new Set<string>();

  for (const entry of exploration) {
    if (entry.kind !== "concept" && entry.kind !== "case" && entry.kind !== "ending") {
      continue;
    }
    const matchesText = [...textIds].some((id) => entry.href.includes(id));
    if (matchesText) {
      labels.add(entry.label.trim().toLowerCase());
    }
  }

  return labels.size;
}

function pickLayout(index: number, textCount: number): LibraryCollectionLayout {
  if (textCount === 0) {
    return "compact";
  }
  return LAYOUT_CYCLE[index % LAYOUT_CYCLE.length] ?? "medium";
}

export function buildLibraryCollections(input: {
  texts: TextListItem[];
  readingProgress: Record<string, TextReadingProgress>;
  exploration?: ExplorationEntry[];
}): LibraryCollectionSummary[] {
  const displayable = input.texts.filter(isDisplayableLibraryText);
  const exploration = input.exploration ?? [];

  return getAllCollections().map((collection, index) => {
    const record = getCollectionRecord(collection.id);
    const collectionTexts = displayable.filter((text) => text.collectionId === collection.id);
    const readingMinutes = collectionTexts.map((text) =>
      estimateReadingMinutes(text.sentenceCount),
    );
    const readingMinutesTotal = readingMinutes.reduce((sum, minutes) => sum + minutes, 0);
    const averageReadingMinutes =
      readingMinutes.length > 0
        ? Math.round(readingMinutes.reduce((sum, minutes) => sum + minutes, 0) / readingMinutes.length)
        : 0;

    const wordsDiscovered = collectionTexts.reduce((total, text) => {
      return total + (input.readingProgress[text.id]?.wordsSeenIds.length ?? 0);
    }, 0);

    return {
      id: collection.id,
      name: record.name,
      russianTitle: RUSSIAN_TITLES[collection.id],
      description: record.description,
      level: dominantLevel(collectionTexts),
      textCount: collectionTexts.length,
      readingMinutesTotal,
      averageReadingMinutes,
      wordsDiscovered,
      conceptsExplored: conceptsForCollection(collectionTexts, exploration),
      progressPercent: collectionProgressPercent(collectionTexts, input.readingProgress),
      continueHref: continueHrefForCollection(collectionTexts, input.readingProgress),
      layout: pickLayout(index, collectionTexts.length),
    };
  });
}
