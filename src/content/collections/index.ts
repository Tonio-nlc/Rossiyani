export type { Collection, CollectionId } from "./collection";
export {
  COLLECTIONS,
  DEFAULT_COLLECTION_ID,
  getCollectionRecord,
  isCollectionId,
} from "./registry";
export {
  getAllCollections,
  getCollectionById,
  getCollectionBySlug,
  getCollectionName,
  inferCollectionFromImportHints,
  resolveCollectionIdFromLegacySource,
  resolveTextCollectionId,
} from "./helpers";
