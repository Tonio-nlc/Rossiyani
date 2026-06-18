import type { Category, CategoryId } from "./category";

export const CATEGORIES: readonly Category[] = [
  { id: "articles", label: "Articles", order: 1 },
  { id: "dialogues", label: "Dialogues", order: 2 },
  { id: "contes", label: "Contes", order: 3 },
  { id: "telegram", label: "Telegram", order: 4 },
  { id: "actualites", label: "Actualités", order: 5 },
] as const;

const CATEGORY_BY_ID = new Map<CategoryId, Category>(
  CATEGORIES.map((category) => [category.id, category]),
);

export function isCategoryId(value: string): value is CategoryId {
  return CATEGORY_BY_ID.has(value as CategoryId);
}

export function getCategoryRecord(id: CategoryId): Category {
  return CATEGORY_BY_ID.get(id)!;
}
