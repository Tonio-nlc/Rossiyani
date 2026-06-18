import type { Category, CategoryId } from "./category";
import { CATEGORIES, getCategoryRecord, isCategoryId } from "./registry";

export function getAllCategories(): Category[] {
  return [...CATEGORIES].sort((a, b) => a.order - b.order);
}

export function getCategoryById(id: string): Category | null {
  if (isCategoryId(id)) {
    return getCategoryRecord(id);
  }
  return null;
}

export function getCategoryLabel(id: string): string {
  return getCategoryById(id)?.label ?? id;
}

export function normalizeCategoryIds(ids: string[] | null | undefined): CategoryId[] {
  if (!ids?.length) {
    return [];
  }
  return ids.filter(isCategoryId);
}

const TAG_MATCHERS: Record<CategoryId, RegExp> = {
  articles: /article|journal|presse|blog|medium/i,
  dialogues: /dialogue|conversation|chat|échange/i,
  contes: /conte|fable|nouvelle|story|рассказ/i,
  telegram: /telegram|tg|канал/i,
  actualites: /actualit|news|новост|presse/i,
};

/** Heuristic fallback when a text has no persisted categoryIds. */
export function inferCategoryIdsFromText(title: string, collectionId: string): CategoryId[] {
  const haystack = `${title} ${collectionId}`;
  return CATEGORIES.filter(({ id }) => TAG_MATCHERS[id].test(haystack)).map(({ id }) => id);
}
