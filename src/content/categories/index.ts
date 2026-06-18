export type { Category, CategoryId } from "./category";
export { CATEGORIES, getCategoryRecord, isCategoryId } from "./registry";
export {
  getAllCategories,
  getCategoryById,
  getCategoryLabel,
  inferCategoryIdsFromText,
  normalizeCategoryIds,
} from "./helpers";
