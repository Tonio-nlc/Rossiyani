import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { TextNotFoundError } from "./rename-text";

export { TextNotFoundError };

export type DeleteTextResult = {
  deleted: true;
  textId: string;
  title: string;
};

async function refreshOccurrenceCounts(
  tx: Prisma.TransactionClient,
  formIds: string[],
  lemmaIds: string[],
  phraseIds: string[],
): Promise<void> {
  for (const formId of formIds) {
    const count = await tx.knowledgeOccurrence.count({ where: { formId } });
    await tx.knowledgeForm.update({
      where: { id: formId },
      data: { occurrenceCount: count },
    });
  }

  for (const lemmaId of lemmaIds) {
    const count = await tx.knowledgeOccurrence.count({ where: { lemmaId } });
    await tx.knowledgeLemma.update({
      where: { id: lemmaId },
      data: { occurrenceCount: count },
    });
  }

  for (const phraseId of phraseIds) {
    const count = await tx.knowledgePhraseOccurrence.count({ where: { phraseId } });
    await tx.knowledgePhrase.update({
      where: { id: phraseId },
      data: { occurrenceCount: count },
    });
  }
}

/**
 * Deletes a text and all text-owned rows. Preserves shared KnowledgeGraph entities
 * (lemmas, forms, phrases, concepts) and only removes occurrences tied to this text.
 */
export async function deleteText(textId: string): Promise<DeleteTextResult> {
  const text = await prisma.text.findUnique({
    where: { id: textId },
    select: {
      id: true,
      title: true,
      sentences: {
        select: {
          words: { select: { id: true } },
        },
      },
    },
  });

  if (!text) {
    throw new TextNotFoundError();
  }

  const wordIds = text.sentences.flatMap((sentence) => sentence.words.map((word) => word.id));

  await prisma.$transaction(async (tx) => {
    const wordOccurrences = await tx.knowledgeOccurrence.findMany({
      where: {
        OR: [{ textId }, ...(wordIds.length > 0 ? [{ wordInstanceId: { in: wordIds } }] : [])],
      },
      select: { formId: true, lemmaId: true },
    });

    const phraseOccurrences = await tx.knowledgePhraseOccurrence.findMany({
      where: { textId },
      select: { phraseId: true },
    });

    const formIds = [...new Set(wordOccurrences.map((row) => row.formId))];
    const lemmaIds = [...new Set(wordOccurrences.map((row) => row.lemmaId))];
    const phraseIds = [...new Set(phraseOccurrences.map((row) => row.phraseId))];

    await tx.knowledgeOccurrence.deleteMany({
      where: {
        OR: [{ textId }, ...(wordIds.length > 0 ? [{ wordInstanceId: { in: wordIds } }] : [])],
      },
    });

    await tx.knowledgePhraseOccurrence.deleteMany({ where: { textId } });

    await refreshOccurrenceCounts(tx, formIds, lemmaIds, phraseIds);

    await tx.importJobItem.updateMany({
      where: { textId },
      data: { textId: null },
    });

    await tx.text.delete({ where: { id: textId } });
  });

  return { deleted: true, textId, title: text.title };
}
