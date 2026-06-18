import type { Collection, CollectionId } from "./collection";
import {
  COLLECTIONS,
  DEFAULT_COLLECTION_ID,
  getCollectionRecord,
  isCollectionId,
} from "./registry";

export function getAllCollections(): Collection[] {
  return [...COLLECTIONS].sort((a, b) => a.order - b.order);
}

export function getCollectionById(id: string | null | undefined): Collection {
  if (id && isCollectionId(id)) {
    return getCollectionRecord(id);
  }
  return getCollectionRecord(DEFAULT_COLLECTION_ID);
}

export function getCollectionBySlug(slug: string): Collection | null {
  if (isCollectionId(slug)) {
    return getCollectionRecord(slug);
  }
  return null;
}

export function getCollectionName(id: string | null | undefined): string {
  return getCollectionById(id).name;
}

type LegacyTextFields = {
  collectionId?: string | null;
  source?: string | null;
};

/**
 * Resolves the editorial collection for a text.
 * Uses persisted collectionId when valid; otherwise maps legacy free-text source.
 */
export function resolveTextCollectionId(text: LegacyTextFields): CollectionId {
  if (text.collectionId && isCollectionId(text.collectionId)) {
    return text.collectionId;
  }
  return resolveCollectionIdFromLegacySource(text.source);
}

export function resolveCollectionIdFromLegacySource(source: string | null | undefined): CollectionId {
  if (!source?.trim()) {
    return DEFAULT_COLLECTION_ID;
  }

  const normalized = source.trim().toLowerCase();

  if (isCollectionId(normalized)) {
    return normalized;
  }

  const slugLike = normalized.replace(/\s+/g, "-");
  if (isCollectionId(slugLike)) {
    return slugLike;
  }

  const matchers: Array<{ pattern: RegExp; id: CollectionId }> = [
    { pattern: /everyday|quotidien|daily|russian life/i, id: "everyday-russian" },
    { pattern: /stor|conte|nouvelle|рассказ|fiction/i, id: "stories" },
    { pattern: /telegram|tg|канал/i, id: "telegram" },
    { pattern: /slow.?news|actualit|news|новост/i, id: "slow-news" },
    { pattern: /dialog|conversation|échange|chat/i, id: "dialogues" },
    { pattern: /travel|voyage|trip|tur/i, id: "travel-russian" },
    { pattern: /culture|tradition|heritage/i, id: "culture" },
  ];

  for (const { pattern, id } of matchers) {
    if (pattern.test(source)) {
      return id;
    }
  }

  return DEFAULT_COLLECTION_ID;
}

export function inferCollectionFromImportHints(hints: {
  source?: string | null;
  category?: string | null;
  fileName?: string | null;
}): CollectionId {
  const fromSource = resolveCollectionIdFromLegacySource(hints.source);
  if (fromSource !== DEFAULT_COLLECTION_ID || hints.source?.trim()) {
    return fromSource;
  }

  const haystack = `${hints.category ?? ""} ${hints.fileName ?? ""}`;
  return resolveCollectionIdFromLegacySource(haystack);
}
