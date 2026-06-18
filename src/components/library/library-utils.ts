import type { CategoryId } from "@/content/categories";
import {
  getCategoryLabel,
  inferCategoryIdsFromText,
} from "@/content/categories";
import type { CollectionId } from "@/content/collections";
import { getAllCollections, getCollectionName } from "@/content/collections";
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
