import { prisma } from "@/lib/prisma";
import type { CefrLevel } from "@/types";

export type TextListItem = {
  id: string;
  title: string;
  level: CefrLevel;
  source: string | null;
  createdAt: Date;
  sentenceCount: number;
};

export type ListTextsFilters = {
  level?: CefrLevel;
  search?: string;
};

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

  return texts.map((text) => ({
    id: text.id,
    title: text.title,
    level: text.level,
    source: text.source,
    createdAt: text.createdAt,
    sentenceCount: text._count.sentences,
  }));
}
