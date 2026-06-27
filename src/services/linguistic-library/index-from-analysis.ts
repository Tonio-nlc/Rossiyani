import {
  endingLookupKey,
  formLookupKey,
  phraseLookupKey,
  sentenceLookupKey,
} from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { IndexAnalysisResult } from "@/types/linguistic-library";
import { isPhraseExplorerEligible } from "@/features/explorer/entity/explorer-eligibility";

/**
 * Indexes a validated SentenceAnalysisOutput into the LinguisticLibrary.
 * Called after Zod validation — never before.
 */
export async function indexFromAnalysis(
  analysis: SentenceAnalysisOutput,
): Promise<IndexAnalysisResult> {
  let formsIndexed = 0;
  let lemmasIndexed = 0;
  let endingsIndexed = 0;
  let phrasesIndexed = 0;

  const sentenceKey = sentenceLookupKey(analysis.russianText);
  await prisma.knowledgeSentence.upsert({
    where: { russianTextKey: sentenceKey },
    create: {
      russianTextKey: sentenceKey,
      russianText: analysis.russianText,
      analysisJson: JSON.stringify(analysis),
      needsReview: analysis.needsReview ?? false,
      hitCount: 1,
    },
    update: {
      analysisJson: JSON.stringify(analysis),
      needsReview: analysis.needsReview ?? false,
      hitCount: { increment: 1 },
    },
  });

  for (const word of analysis.words) {
    const lemmaKey = {
      lemma: word.lemma,
      partOfSpeech: word.partOfSpeech,
    };
    const existingLemma = await prisma.knowledgeLemma.findUnique({
      where: { lemma_partOfSpeech: lemmaKey },
      select: { id: true, frenchComparison: true, lexicalType: true },
    });

    const lemma = existingLemma
      ? await prisma.knowledgeLemma.update({
          where: { id: existingLemma.id },
          data: {
            stressMarked: word.stressMarked,
            frequency: word.frequency ?? undefined,
            frequencyTier: word.frequencyTier ?? undefined,
            ...(existingLemma.lexicalType === null
              ? {
                  isProperNoun: word.isProperNoun,
                  lexicalType: word.lexicalType,
                }
              : {}),
          },
        })
      : await prisma.knowledgeLemma.create({
          data: {
            ...lemmaKey,
            isProperNoun: word.isProperNoun,
            lexicalType: word.lexicalType,
            stressMarked: word.stressMarked,
            frequency: word.frequency ?? null,
            frequencyTier: word.frequencyTier ?? null,
            frenchComparison: word.translationCanonical ?? null,
          },
        });
    lemmasIndexed += 1;

    if (word.translationCanonical && !lemma.frenchComparison && !existingLemma?.frenchComparison) {
      await prisma.knowledgeLemma.update({
        where: { id: lemma.id },
        data: { frenchComparison: word.translationCanonical },
      });
    }

    const originalKey = formLookupKey(word.original);
    const existingForm = await prisma.knowledgeForm.findUnique({
      where: { originalKey },
    });

    await prisma.knowledgeForm.upsert({
      where: { originalKey },
      create: {
        lemmaId: lemma.id,
        originalKey,
        original: word.original,
        stressMarked: word.stressMarked,
        stem: word.stem,
        ending: word.ending,
        partOfSpeech: word.partOfSpeech,
        case: word.case ?? null,
        gender: word.gender ?? null,
        number: word.number ?? null,
        tense: word.tense ?? null,
        aspect: word.aspect ?? null,
        explanation: word.explanation,
      },
      update: {
        explanation: word.explanation,
        stressMarked: word.stressMarked,
        stem: word.stem,
        ending: word.ending,
        hitCount: { increment: 1 },
      },
    });
    formsIndexed += existingForm ? 0 : 1;

    if (word.ending) {
      const eKey = endingLookupKey(word.ending, word.case);
      const caseNode = word.case
        ? await prisma.knowledgeCase.findUnique({
            where: { caseKey: word.case },
          })
        : null;
      const existingEnding = await prisma.knowledgeEnding.findUnique({
        where: { endingKey: eKey },
      });
      await prisma.knowledgeEnding.upsert({
        where: { endingKey: eKey },
        create: {
          endingKey: eKey,
          ending: word.ending,
          caseKey: word.case ?? "_",
          caseId: caseNode?.id ?? null,
          partOfSpeech: word.partOfSpeech,
          explanationFr: word.explanation,
        },
        update: {
          hitCount: { increment: 1 },
          caseId: caseNode?.id ?? undefined,
        },
      });
      endingsIndexed += existingEnding ? 0 : 1;
    }
  }

  for (const group of analysis.phraseGroups) {
    if (!isPhraseExplorerEligible(group.label, group.type)) {
      continue;
    }

    const labelKey = phraseLookupKey(group.label);
    const existing = await prisma.knowledgePhrase.findUnique({
      where: { labelKey },
    });
    await prisma.knowledgePhrase.upsert({
      where: { labelKey },
      create: {
        labelKey,
        label: group.label,
        type: group.type,
        explanation: group.explanation,
      },
      update: {
        explanation: group.explanation,
        hitCount: { increment: 1 },
      },
    });
    phrasesIndexed += existing ? 0 : 1;
  }

  return {
    sentenceCached: true,
    formsIndexed,
    lemmasIndexed,
    endingsIndexed,
    phrasesIndexed,
  };
}
