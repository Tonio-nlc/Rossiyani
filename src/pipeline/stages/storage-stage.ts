import type { SentenceAnalysisState } from "@prisma/client";

import {
  auditPipelineStep,
  auditPreviewText,
} from "@/lib/diagnostics/import-pipeline-audit";
import { formLookupKey, phraseLookupKey } from "@/lib/normalization/russian-key";
import { wordTranslationForStorage } from "@/lib/import/word-translation";
import { wordLexicalStorageFields } from "@/lib/linguistics/word-lexical-storage";
import { prisma } from "@/lib/prisma";
import type { WordAnalysisOutput } from "@/types/analysis";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { SentencePipelineContext, StorageOutput } from "@/domain/pipeline";

async function resolveFormAndPhraseMaps(analysis: SentenceAnalysisOutput) {
  const sortedWords = [...analysis.words].sort((a, b) => a.position - b.position);

  const formIdByPosition = new Map<number, string>();
  const originalKeys = sortedWords.map((word) => formLookupKey(word.original));
  const forms =
    originalKeys.length > 0
      ? await prisma.knowledgeForm.findMany({
          where: { originalKey: { in: originalKeys } },
          select: { id: true, originalKey: true },
        })
      : [];
  const formIdByKey = new Map(forms.map((form) => [form.originalKey, form.id]));
  for (const word of sortedWords) {
    const formId = formIdByKey.get(formLookupKey(word.original));
    if (formId) {
      formIdByPosition.set(word.position, formId);
    }
  }

  const phraseIdByLabel = new Map<string, string>();
  const phraseKeys = analysis.phraseGroups.map((group) => phraseLookupKey(group.label));
  const phrases =
    phraseKeys.length > 0
      ? await prisma.knowledgePhrase.findMany({
          where: { labelKey: { in: phraseKeys } },
          select: { id: true, labelKey: true },
        })
      : [];
  const phraseIdByKey = new Map(phrases.map((phrase) => [phrase.labelKey, phrase.id]));
  for (const group of analysis.phraseGroups) {
    const phraseId = phraseIdByKey.get(phraseLookupKey(group.label));
    if (phraseId) {
      phraseIdByLabel.set(group.label, phraseId);
    }
  }

  return { sortedWords, formIdByPosition, phraseIdByLabel };
}

function sentenceDataFields(
  analysis: SentenceAnalysisOutput,
  ctx: SentencePipelineContext,
  sortedWords: WordAnalysisOutput[],
  formIdByPosition: Map<number, string>,
  phraseIdByLabel: Map<string, string>,
  analysisState: SentenceAnalysisState,
) {
  return {
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
    analysisState,
    analysisJson: JSON.stringify(analysis),
    syntaxAnalysisJson: ctx.syntaxAnalysis ? JSON.stringify(ctx.syntaxAnalysis) : null,
    culturalNotesJson: ctx.culturalNotes.length > 0 ? JSON.stringify(ctx.culturalNotes) : null,
    words: {
      create: sortedWords.map((word) => {
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
          formId: formIdByPosition.get(word.position) ?? null,
        };
      }),
    },
    phraseGroups: {
      create: analysis.phraseGroups.map((group) => ({
        type: group.type,
        label: group.label,
        explanation: group.explanation,
        startPosition: group.startPosition,
        endPosition: group.endPosition,
        phraseId: phraseIdByLabel.get(group.label) ?? null,
      })),
    },
  };
}

/**
 * Stage 10 — Storage: persist sentence, words, phrase groups + full analysis JSON.
 * No AI — writes to database and resolves KnowledgeForm/Phrase FKs.
 */
export async function runStorageStage(
  ctx: SentencePipelineContext,
  analysis: SentenceAnalysisOutput,
): Promise<{ ctx: SentencePipelineContext; output: StorageOutput }> {
  const { sortedWords, formIdByPosition, phraseIdByLabel } =
    await resolveFormAndPhraseMaps(analysis);

  const sentence = await auditPipelineStep(
    "storage",
    "storage-stage.ts:create",
    {
      sentenceIndex: ctx.position + 1,
      textId: ctx.textId,
      position: ctx.position,
      wordCount: sortedWords.length,
      phraseGroupCount: analysis.phraseGroups.length,
      russianText: auditPreviewText(analysis.russianText),
    },
    () =>
      prisma.sentence.create({
        data: {
          textId: ctx.textId,
          position: ctx.position,
          ...sentenceDataFields(
            analysis,
            ctx,
            sortedWords,
            formIdByPosition,
            phraseIdByLabel,
            "READY",
          ),
        },
        include: { words: true, phraseGroups: true },
      }),
    (created) => ({
      saved: true,
      sentenceId: created.id,
      words: created.words.length,
      phraseGroups: created.phraseGroups.length,
    }),
  );

  const output: StorageOutput = {
    sentenceId: sentence.id,
    wordIds: sentence.words.map((w) => ({
      id: w.id,
      position: w.position,
      original: w.original,
      formId: w.formId,
    })),
    phraseGroupCount: sentence.phraseGroups.length,
  };

  return {
    ctx: {
      ...ctx,
      sentenceId: sentence.id,
      formIdByPosition,
      phraseIdByLabel,
    },
    output,
  };
}

/** Replace a shell sentence with full analysis after background enrichment. */
export async function runStorageUpdateStage(
  ctx: SentencePipelineContext,
  analysis: SentenceAnalysisOutput,
  sentenceId: string,
): Promise<{ ctx: SentencePipelineContext; output: StorageOutput }> {
  const { sortedWords, formIdByPosition, phraseIdByLabel } =
    await resolveFormAndPhraseMaps(analysis);

  await prisma.word.deleteMany({ where: { sentenceId } });
  await prisma.phraseGroup.deleteMany({ where: { sentenceId } });

  const sentence = await auditPipelineStep(
    "storage",
    "storage-stage.ts:update",
    {
      sentenceIndex: ctx.position + 1,
      textId: ctx.textId,
      sentenceId,
      wordCount: sortedWords.length,
      phraseGroupCount: analysis.phraseGroups.length,
      russianText: auditPreviewText(analysis.russianText),
    },
    () =>
      prisma.sentence.update({
        where: { id: sentenceId },
        data: sentenceDataFields(
          analysis,
          ctx,
          sortedWords,
          formIdByPosition,
          phraseIdByLabel,
          "READY",
        ),
        include: { words: true, phraseGroups: true },
      }),
    (updated) => ({
      saved: true,
      sentenceId: updated.id,
      words: updated.words.length,
      phraseGroups: updated.phraseGroups.length,
    }),
  );

  const output: StorageOutput = {
    sentenceId: sentence.id,
    wordIds: sentence.words.map((w) => ({
      id: w.id,
      position: w.position,
      original: w.original,
      formId: w.formId,
    })),
    phraseGroupCount: sentence.phraseGroups.length,
  };

  return {
    ctx: {
      ...ctx,
      sentenceId: sentence.id,
      formIdByPosition,
      phraseIdByLabel,
    },
    output,
  };
}

/** Mark a sentence as failed enrichment while keeping the shell readable. */
export async function markSentenceEnrichmentFailed(sentenceId: string, message: string): Promise<void> {
  await prisma.sentence.update({
    where: { id: sentenceId },
    data: {
      analysisState: "FAILED",
      needsReview: true,
      reviewMessage: message,
    },
  });
}

export async function markSentenceProcessing(sentenceId: string): Promise<void> {
  await prisma.sentence.update({
    where: { id: sentenceId },
    data: { analysisState: "PROCESSING" },
  });
}
