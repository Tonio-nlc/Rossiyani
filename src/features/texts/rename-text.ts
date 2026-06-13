import { prisma } from "@/lib/prisma";

import { type TextListItem } from "./list-texts";
import { validateTextTitle } from "./text-title-validation";

export class TextNotFoundError extends Error {
  constructor() {
    super("Texte introuvable.");
    this.name = "TextNotFoundError";
  }
}

export class TextTitleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TextTitleValidationError";
  }
}

export async function renameText(textId: string, rawTitle: string): Promise<TextListItem> {
  const validation = validateTextTitle(rawTitle);
  if (!validation.ok) {
    throw new TextTitleValidationError(validation.error);
  }

  const existing = await prisma.text.findUnique({
    where: { id: textId },
    select: { id: true },
  });
  if (!existing) {
    throw new TextNotFoundError();
  }

  const updated = await prisma.$transaction(async (tx) => {
    const text = await tx.text.update({
      where: { id: textId },
      data: { title: validation.title },
      include: { _count: { select: { sentences: true } } },
    });

    await tx.knowledgeOccurrence.updateMany({
      where: { textId },
      data: { textTitle: validation.title },
    });

    await tx.knowledgePhraseOccurrence.updateMany({
      where: { textId },
      data: { textTitle: validation.title },
    });

    return text;
  });

  return {
    id: updated.id,
    title: updated.title,
    level: updated.level,
    source: updated.source,
    createdAt: updated.createdAt,
    sentenceCount: updated._count.sentences,
  };
}
