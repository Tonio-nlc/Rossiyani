import type { CategoryId } from "@/content/categories";
import type { CollectionId } from "@/content/collections";
import { resolveTextCollectionId } from "@/content/collections";
import { normalizeCategoryIds } from "@/content/categories";
import { prisma } from "@/lib/prisma";
import type { CefrLevel } from "@/types";

type TextRow = {
  id: string;
  title: string;
  level: CefrLevel;
  collectionId: string;
  categoryIds: string[];
  source: string | null;
  createdAt: Date;
  _count: { sentences: number };
};

export type TextListItem = {
  id: string;
  title: string;
  level: CefrLevel;
  collectionId: CollectionId;
  categoryIds: CategoryId[];
  createdAt: Date;
  sentenceCount: number;
};

export type ListTextsFilters = {
  level?: CefrLevel;
  search?: string;
};

export function mapTextListItem(text: TextRow): TextListItem {
  return {
    id: text.id,
    title: text.title,
    level: text.level,
    collectionId: resolveTextCollectionId({
      collectionId: text.collectionId,
      source: text.source,
    }),
    categoryIds: normalizeCategoryIds(text.categoryIds),
    createdAt: text.createdAt,
    sentenceCount: text._count.sentences,
  };
}

export async function listTexts(filters?: ListTextsFilters): Promise<TextListItem[]> {
  const texts = await prisma.text.findMany({
    where: {
      ...(filters?.level ? { level: filters.level } : {}),
      ...(filters?.search
        ? { title: { contains: filters.search } }
        : {}),
    },
    orderBy: [{ level: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { sentences: true } } },
  });

  return texts.map(mapTextListItem);
}
