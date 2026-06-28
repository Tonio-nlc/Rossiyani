import { formLookupKey } from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { StorageOutput } from "@/domain/pipeline";
import type { PatternIndexerKnowledgeContext } from "@/types/pattern-instances";

/**
 * Resolves Knowledge Graph links for pattern indexing without re-running analysis.
 */
export async function resolveIndexerKnowledgeContext(
  analysis: SentenceAnalysisOutput,
  storage: StorageOutput,
): Promise<PatternIndexerKnowledgeContext> {
  const occurrenceIdsByPosition: Record<number, string> = {};

  for (const word of storage.wordIds) {
    const formRow = await prisma.knowledgeForm.findUnique({
      where: { originalKey: formLookupKey(word.original) },
      select: { id: true },
    });
    if (!formRow) {
      continue;
    }

    const occurrence = await prisma.knowledgeOccurrence.findFirst({
      where: {
        formId: formRow.id,
        wordPosition: word.position,
        sentenceRussian: analysis.russianText,
      },
      select: { id: true },
    });

    if (occurrence) {
      occurrenceIdsByPosition[word.position] = occurrence.id;
    }
  }

  const phraseOccurrenceIds: PatternIndexerKnowledgeContext["phraseOccurrenceIds"] = [];

  for (const group of analysis.phraseGroups) {
    const phraseOccurrence = await prisma.knowledgePhraseOccurrence.findFirst({
      where: {
        sentenceRussian: analysis.russianText,
        startPosition: group.startPosition,
        endPosition: group.endPosition,
      },
      select: { id: true },
    });

    if (phraseOccurrence) {
      phraseOccurrenceIds.push({
        startPosition: group.startPosition,
        endPosition: group.endPosition,
        id: phraseOccurrence.id,
      });
    }
  }

  const conceptRows = await prisma.knowledgeConceptSentence.findMany({
    where: { sentenceId: storage.sentenceId },
    include: { concept: { select: { conceptKey: true } } },
  });

  return {
    conceptKeys: conceptRows.map((row) => row.concept.conceptKey),
    occurrenceIdsByPosition,
    phraseOccurrenceIds,
  };
}
