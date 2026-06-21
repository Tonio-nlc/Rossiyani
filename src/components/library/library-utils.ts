import type { CategoryId } from "@/content/categories";
import {
  getCategoryLabel,
  inferCategoryIdsFromText,
} from "@/content/categories";
import type { CollectionId } from "@/content/collections";
import { getAllCollections, getCollectionById, getCollectionName } from "@/content/collections";
import type { CefrLevel } from "@/types";
import type { TextListItem } from "@/features/texts";

export type LibraryCategoryFilter = CategoryId | "all";
export type LibraryCollectionFilter = CollectionId | "all";

export const LIBRARY_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "Native"];

export const LIBRARY_COLLECTIONS = getAllCollections();

export function getTextCategoryIds(text: TextListItem): CategoryId[] {
  if (text.categoryIds.length > 0) {
    return text.categoryIds;
  }
  return inferCategoryIdsFromText(text.title, text.collectionId);
}

export function textMatchesCategory(text: TextListItem, categoryId: CategoryId): boolean {
  return getTextCategoryIds(text).includes(categoryId);
}

export function textMatchesCollection(text: TextListItem, collectionId: CollectionId): boolean {
  return text.collectionId === collectionId;
}

export function estimateReadingMinutes(sentenceCount: number): number {
  return Math.max(1, Math.ceil(sentenceCount * 0.45));
}

export function estimateWordCount(sentenceCount: number): number {
  return sentenceCount * 12;
}

export function formatStat(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }
  return value.toLocaleString("fr-FR");
}

const CYRILLIC_PATTERN = /[а-яА-ЯёЁ]/;

/** Display-only split when title follows "French : Russian" editorial patterns. */
export function splitLibraryTitle(title: string): { russian: string; french: string | null } {
  const colonMatch = title.match(/^(.+?)\s*:\s*(.+)$/);
  if (!colonMatch) {
    return { russian: title, french: null };
  }

  const part1 = colonMatch[1].trim();
  const part2 = colonMatch[2].trim();
  const part1Cyrillic = CYRILLIC_PATTERN.test(part1);
  const part2Cyrillic = CYRILLIC_PATTERN.test(part2);

  if (part2Cyrillic && !part1Cyrillic) {
    return { russian: part2, french: part1 };
  }
  if (part1Cyrillic && !part2Cyrillic) {
    return { russian: part1, french: part2 };
  }

  return { russian: title, french: null };
}

/** First sentence of collection description — one-line card preview. */
export function getTextPreviewLine(collectionId: CollectionId): string {
  const description = getCollectionById(collectionId).description;
  const sentence = description.split(/(?<=[.!?])\s+/)[0]?.trim() ?? description;
  return sentence.length > 120 ? `${sentence.slice(0, 117).trimEnd()}…` : sentence;
}

const CEFR_LEVEL_LABELS: Record<CefrLevel, string> = {
  A1: "DÉBUTANT",
  A2: "INTERMÉDIAIRE",
  B1: "AVANCÉ",
  B2: "SUPÉRIEUR",
  C1: "EXPERT",
  Native: "NATIF",
};

export function getCefrLevelLabel(level: CefrLevel): string {
  return CEFR_LEVEL_LABELS[level];
}

/** Two to three lines of editorial description for text cards. */
export function getTextDescription(collectionId: CollectionId): string {
  const description = getCollectionById(collectionId).description;
  const excerpt = description
    .split(/(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(" ")
    .trim();
  if (excerpt.length <= 200) {
    return excerpt;
  }
  return `${excerpt.slice(0, 197).trimEnd()}…`;
}

export function filterLibraryTexts(
  texts: TextListItem[],
  query: string,
  level: CefrLevel | "all",
  collection: LibraryCollectionFilter,
  category: LibraryCategoryFilter,
): TextListItem[] {
  const q = query.trim().toLowerCase();
  return texts.filter((text) => {
    if (level !== "all" && text.level !== level) {
      return false;
    }
    if (collection !== "all" && !textMatchesCollection(text, collection)) {
      return false;
    }
    if (category !== "all" && !textMatchesCategory(text, category)) {
      return false;
    }
    if (!q) {
      return true;
    }
    const inTitle = text.title.toLowerCase().includes(q);
    const inCollection = getCollectionName(text.collectionId).toLowerCase().includes(q);
    const inCategories = getTextCategoryIds(text).some((id) =>
      getCategoryLabel(id).toLowerCase().includes(q),
    );
    const inLevel = text.level.toLowerCase().includes(q);
    return inTitle || inCollection || inCategories || inLevel;
  });
}

/** @deprecated Use getTextCategoryIds */
export function detectTextTags(text: TextListItem): CategoryId[] {
  return getTextCategoryIds(text);
}

/** @deprecated Use textMatchesCategory */
export function textMatchesTag(text: TextListItem, tag: CategoryId): boolean {
  return textMatchesCategory(text, tag);
}

/** @deprecated Use getAllCategories from @/content/categories */
export { getAllCategories as LIBRARY_TAGS_SOURCE } from "@/content/categories";
