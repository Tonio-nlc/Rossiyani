import type { Prisma } from "@prisma/client";

import { auditPipelineStep } from "@/lib/diagnostics/import-pipeline-audit";
import { logImportError, logPrismaError } from "@/lib/diagnostics";
import { wordTranslationForStorage } from "@/lib/import/word-translation";
import { wordLexicalStorageFields } from "@/lib/linguistics/word-lexical-storage";
import { prisma } from "@/lib/prisma";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";

export async function persistSentenceAnalysis(
  textId: string,
  position: number,
  analysis: SentenceAnalysisOutput,
): Promise<{
  sentenceId: string;
  phraseGroupCount: number;
  words: Array<{ id: string; position: number; original: string }>;
}> {
  const sortedWords = [...analysis.words].sort((a, b) => a.position - b.position);
  const context = {
    textId,
    position,
    russianText: analysis.russianText,
    wordCount: sortedWords.length,
    phraseGroupCount: analysis.phraseGroups.length,
  };

  try {
    const sentence = await auditPipelineStep(
      "persistSentenceAnalysis",
      "persist-sentence.ts:27",
      context,
      () =>
        prisma.sentence.create({
          data: {
            textId,
            position,
            russianText: analysis.russianText,
            literalTranslation: analysis.literalTranslation,
            naturalTranslation: analysis.naturalTranslation,
            russianLogic: analysis.russianLogic,
            orderExplanation: analysis.orderExplanation,
            nativeUsageNotes: analysis.nativeUsageNotes,
            register: analysis.register,
            difficultyScore: analysis.difficultyScore,
            needsReview: analysis.needsReview ?? false,
            reviewMessage: analysis.reviewMessage ?? null,
            words: {
              create: sortedWords.map((word) => mapWord(word)),
            },
            phraseGroups: {
              create: analysis.phraseGroups.map((group) => ({
                type: group.type,
                label: group.label,
                explanation: group.explanation,
                startPosition: group.startPosition,
                endPosition: group.endPosition,
              })),
            },
          },
          include: { phraseGroups: true, words: true },
        }),
      (created) => ({
        saved: true,
        sentenceId: created.id,
        words: created.words.length,
      }),
    );

    return {
      sentenceId: sentence.id,
      phraseGroupCount: sentence.phraseGroups.length,
      words: sentence.words.map((w) => ({
        id: w.id,
        position: w.position,
        original: w.original,
      })),
    };
  } catch (error) {
    logPrismaError("persistSentenceAnalysis", error, context);
    logImportError("persistSentenceAnalysis", error, context);
    throw error;
  }
}

function mapWord(word: SentenceAnalysisOutput["words"][number]): Prisma.WordCreateWithoutSentenceInput {
  const translation = wordTranslationForStorage(word);
  return {
    position: word.position,
    original: word.original,
    lemma: word.lemma,
    stressMarked: word.stressMarked,
    stem: word.stem,
    ending: word.ending,
    partOfSpeech: word.partOfSpeech,
    ...wordLexicalStorageFields(word),
    case: word.case ?? null,
    gender: word.gender ?? null,
    number: word.number ?? null,
    tense: word.tense ?? null,
    aspect: word.aspect ?? null,
    explanation: word.explanation,
    translationCanonical: translation.translationCanonical,
    translationAlternatives: translation.translationAlternatives ?? undefined,
    frequency: word.frequency ?? null,
    frequencyTier: word.frequencyTier ?? null,
  };
}
