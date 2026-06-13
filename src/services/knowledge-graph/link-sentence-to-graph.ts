import { formLookupKey, phraseLookupKey } from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";

export type LinkSentenceToGraphInput = {
  sentenceId: string;
  analysis: SentenceAnalysisOutput;
};

export type LinkSentenceToGraphResult = {
  conceptSentenceLinks: number;
  phraseSentenceLinks: number;
  lemmaPhraseLinks: number;
};

/**
 * Creates direct Knowledge Graph edges:
 * Concept → Sentence, Expression → Sentence, Lemma → Expression.
 */
export async function linkSentenceToGraph(
  input: LinkSentenceToGraphInput,
): Promise<LinkSentenceToGraphResult> {
  let conceptSentenceLinks = 0;
  let phraseSentenceLinks = 0;
  let lemmaPhraseLinks = 0;

  const linkedConceptIds = new Set<string>();

  for (const word of input.analysis.words) {
    const formRow = await prisma.knowledgeForm.findUnique({
      where: { originalKey: formLookupKey(word.original) },
      include: { lemma: { include: { conceptLinks: true } } },
    });
    if (!formRow) {
      continue;
    }

    for (const link of formRow.lemma.conceptLinks) {
      if (linkedConceptIds.has(link.conceptId)) {
        continue;
      }
      const created = await prisma.knowledgeConceptSentence.upsert({
        where: {
          conceptId_sentenceId: {
            conceptId: link.conceptId,
            sentenceId: input.sentenceId,
          },
        },
        create: {
          conceptId: link.conceptId,
          sentenceId: input.sentenceId,
        },
        update: {},
      });
      if (created) {
        conceptSentenceLinks += 1;
        linkedConceptIds.add(link.conceptId);
      }
    }
  }

  for (const group of input.analysis.phraseGroups) {
    const phraseRow = await prisma.knowledgePhrase.findUnique({
      where: { labelKey: phraseLookupKey(group.label) },
      include: { conceptLinks: true },
    });
    if (!phraseRow) {
      continue;
    }

    await prisma.knowledgePhraseSentence.upsert({
      where: {
        phraseId_sentenceId: {
          phraseId: phraseRow.id,
          sentenceId: input.sentenceId,
        },
      },
      create: {
        phraseId: phraseRow.id,
        sentenceId: input.sentenceId,
      },
      update: {},
    });
    phraseSentenceLinks += 1;

    for (const link of phraseRow.conceptLinks) {
      if (linkedConceptIds.has(link.conceptId)) {
        continue;
      }
      await prisma.knowledgeConceptSentence.upsert({
        where: {
          conceptId_sentenceId: {
            conceptId: link.conceptId,
            sentenceId: input.sentenceId,
          },
        },
        create: {
          conceptId: link.conceptId,
          sentenceId: input.sentenceId,
        },
        update: {},
      });
      conceptSentenceLinks += 1;
      linkedConceptIds.add(link.conceptId);
    }

    for (const word of input.analysis.words) {
      if (word.position < group.startPosition || word.position > group.endPosition) {
        continue;
      }
      const formRow = await prisma.knowledgeForm.findUnique({
        where: { originalKey: formLookupKey(word.original) },
      });
      if (!formRow) {
        continue;
      }

      await prisma.knowledgeLemmaPhrase.upsert({
        where: {
          lemmaId_phraseId: {
            lemmaId: formRow.lemmaId,
            phraseId: phraseRow.id,
          },
        },
        create: {
          lemmaId: formRow.lemmaId,
          phraseId: phraseRow.id,
        },
        update: {},
      });
      lemmaPhraseLinks += 1;
    }
  }

  return { conceptSentenceLinks, phraseSentenceLinks, lemmaPhraseLinks };
}
