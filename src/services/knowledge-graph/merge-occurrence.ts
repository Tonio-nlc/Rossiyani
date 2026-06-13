import { formLookupKey, phraseLookupKey } from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";
import type { MergeOccurrenceInput, MergeOccurrenceResult } from "@/types/knowledge-graph";

import { resolveConceptsFromAnalysis, sentenceKeyForMerge } from "./concept-resolver";

/**
 * Merges a persisted sentence occurrence into the KnowledgeGraph.
 * Cumulative: same lemma/form across texts increments counts and adds examples.
 */
export async function mergeOccurrence(
  input: MergeOccurrenceInput,
): Promise<MergeOccurrenceResult> {
  const sentenceKey = sentenceKeyForMerge(input.analysis.russianText);
  const wordByPosition = new Map(input.words.map((w) => [w.position, w]));

  let occurrencesCreated = 0;
  let occurrencesSkipped = 0;
  let phraseOccurrencesCreated = 0;
  const lemmasTouched = new Set<string>();

  for (const word of input.analysis.words) {
    const formKey = formLookupKey(word.original);
    const formRow = await prisma.knowledgeForm.findUnique({
      where: { originalKey: formKey },
      include: { lemma: true },
    });

    if (!formRow) {
      continue;
    }

    const wordInstance = wordByPosition.get(word.position);
    const existing = await prisma.knowledgeOccurrence.findUnique({
      where: {
        formId_sentenceKey_wordPosition: {
          formId: formRow.id,
          sentenceKey,
          wordPosition: word.position,
        },
      },
    });

    if (existing) {
      occurrencesSkipped += 1;
      continue;
    }

    await prisma.knowledgeOccurrence.create({
      data: {
        formId: formRow.id,
        lemmaId: formRow.lemmaId,
        sentenceKey,
        sentenceRussian: input.analysis.russianText,
        naturalTranslation: input.analysis.naturalTranslation,
        textId: input.textId,
        textTitle: input.textTitle,
        wordInstanceId: wordInstance?.id ?? null,
        wordPosition: word.position,
        explanationSnapshot: word.explanation,
      },
    });

    occurrencesCreated += 1;
    lemmasTouched.add(formRow.lemmaId);

    await prisma.knowledgeForm.update({
      where: { id: formRow.id },
      data: { occurrenceCount: { increment: 1 } },
    });

  }

  for (const lemmaId of lemmasTouched) {
    const count = await prisma.knowledgeOccurrence.count({ where: { lemmaId } });
    await prisma.knowledgeLemma.update({
      where: { id: lemmaId },
      data: { occurrenceCount: count },
    });
  }

  for (const group of input.analysis.phraseGroups) {
    const labelKey = phraseLookupKey(group.label);
    const phraseRow = await prisma.knowledgePhrase.findUnique({
      where: { labelKey },
    });
    if (!phraseRow) {
      continue;
    }

    const existingPhraseOcc = await prisma.knowledgePhraseOccurrence.findUnique({
      where: {
        phraseId_sentenceKey_startPosition: {
          phraseId: phraseRow.id,
          sentenceKey,
          startPosition: group.startPosition,
        },
      },
    });

    if (existingPhraseOcc) {
      continue;
    }

    await prisma.knowledgePhraseOccurrence.create({
      data: {
        phraseId: phraseRow.id,
        sentenceKey,
        sentenceRussian: input.analysis.russianText,
        naturalTranslation: input.analysis.naturalTranslation,
        textId: input.textId,
        textTitle: input.textTitle,
        startPosition: group.startPosition,
        endPosition: group.endPosition,
      },
    });

    phraseOccurrencesCreated += 1;

    const phraseOccCount = await prisma.knowledgePhraseOccurrence.count({
      where: { phraseId: phraseRow.id },
    });
    await prisma.knowledgePhrase.update({
      where: { id: phraseRow.id },
      data: { occurrenceCount: phraseOccCount },
    });
  }

  const conceptsLinked = await resolveConceptsFromAnalysis(input.analysis);

  return {
    occurrencesCreated,
    occurrencesSkipped,
    phraseOccurrencesCreated,
    lemmasUpdated: lemmasTouched.size,
    conceptsLinked,
  };
}
