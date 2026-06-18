import type { Collection, CollectionId } from "./collection";

export const COLLECTIONS: readonly Collection[] = [
  {
    id: "everyday-russian",
    slug: "everyday-russian",
    name: "Everyday Russian",
    description:
      "Textes courts pour la vie quotidienne — métro, courses, conversations du quotidien.",
    order: 1,
  },
  {
    id: "stories",
    slug: "stories",
    name: "Russian Stories",
    description: "Contes, nouvelles et récits pour progresser en contexte narratif.",
    order: 2,
  },
  {
    id: "telegram",
    slug: "telegram",
    name: "Telegram",
    description: "Posts et messages authentiques issus de canaux Telegram.",
    order: 3,
  },
  {
    id: "slow-news",
    slug: "slow-news",
    name: "Slow News",
    description: "Actualités simplifiées pour lire l'information en russe.",
    order: 4,
  },
  {
    id: "dialogues",
    slug: "dialogues",
    name: "Dialogues",
    description: "Conversations et échanges pour entraîner l'oral et le registre parlé.",
    order: 5,
  },
  {
    id: "travel-russian",
    slug: "travel-russian",
    name: "Travel Russian",
    description: "Voyage, transports et situations pratiques sur le terrain.",
    order: 6,
  },
  {
    id: "culture",
    slug: "culture",
    name: "Russian Culture",
    description: "Culture, traditions et références pour comprendre le contexte russe.",
    order: 7,
  },
] as const;

export const DEFAULT_COLLECTION_ID: CollectionId = "everyday-russian";

const COLLECTION_BY_ID = new Map<CollectionId, Collection>(
  COLLECTIONS.map((collection) => [collection.id, collection]),
);

export function getCollectionRecord(id: CollectionId): Collection {
  return COLLECTION_BY_ID.get(id)!;
}

export function isCollectionId(value: string): value is CollectionId {
  return COLLECTION_BY_ID.has(value as CollectionId);
}
