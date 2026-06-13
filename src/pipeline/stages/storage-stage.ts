import {
  auditPipelineStep,
  auditPreviewText,
} from "@/lib/diagnostics/import-pipeline-audit";
import { formLookupKey, phraseLookupKey } from "@/lib/normalization/russian-key";
import { wordTranslationForStorage } from "@/lib/import/word-translation";
import { prisma } from "@/lib/prisma";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { SentencePipelineContext, StorageOutput } from "@/domain/pipeline";

/**
 * Stage 10 — Storage: persist sentence, words, phrase groups + full analysis JSON.
 * No AI — writes to database and resolves KnowledgeForm/Phrase FKs.
 */
export async function runStorageStage(
  ctx: SentencePipelineContext,
  analysis: SentenceAnalysisOutput,
): Promise<{ ctx: SentencePipelineContext; output: StorageOutput }> {
  const sortedWords = [...analysis.words].sort((a, b) => a.position - b.position);

  const formIdByPosition = new Map<number, string>();
  for (const word of sortedWords) {
    const form = await prisma.knowledgeForm.findUnique({
      where: { originalKey: formLookupKey(word.original) },
      select: { id: true },
    });
    if (form) {
      formIdByPosition.set(word.position, form.id);
    }
  }

  const phraseIdByLabel = new Map<string, string>();
  for (const group of analysis.phraseGroups) {
    const phrase = await prisma.knowledgePhrase.findUnique({
      where: { labelKey: phraseLookupKey(group.label) },
      select: { id: true },
    });
    if (phrase) {
      phraseIdByLabel.set(group.label, phrase.id);
    }
  }

  const sentence = await auditPipelineStep(
    "storage",
    "storage-stage.ts:43",
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
          analysisJson: JSON.stringify(analysis),
          syntaxAnalysisJson: ctx.syntaxAnalysis ? JSON.stringify(ctx.syntaxAnalysis) : null,
          culturalNotesJson:
            ctx.culturalNotes.length > 0 ? JSON.stringify(ctx.culturalNotes) : null,
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
