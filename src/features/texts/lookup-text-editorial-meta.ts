import { prisma } from "@/lib/prisma";
import {
  getCollectionName,
  resolveTextCollectionId,
  type CollectionId,
} from "@/content/collections";
import { normalizeCategoryIds, type CategoryId } from "@/content/categories";

export type TextEditorialMeta = {
  collectionId: CollectionId;
  collectionName: string;
  categoryIds: CategoryId[];
};

export async function lookupTextEditorialMeta(
  textIds: string[],
): Promise<Map<string, TextEditorialMeta>> {
  const uniqueIds = [...new Set(textIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const rows = await prisma.text.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, collectionId: true, categoryIds: true, source: true },
  });

  return new Map(
    rows.map((row) => {
      const collectionId = resolveTextCollectionId(row);
      return [
        row.id,
        {
          collectionId,
          collectionName: getCollectionName(collectionId),
          categoryIds: normalizeCategoryIds(row.categoryIds),
        },
      ];
    }),
  );
}

export async function getTextEditorialMeta(textId: string): Promise<TextEditorialMeta | null> {
  const map = await lookupTextEditorialMeta([textId]);
  return map.get(textId) ?? null;
}
