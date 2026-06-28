import {
  auditPreviewText,
  recordPipelineFailure,
  setCurrentSentenceIndex,
  setImportPipelineMeta,
} from "@/lib/diagnostics/import-pipeline-audit";
import { ImportTranslationTracker } from "@/lib/diagnostics/import-translation-tracker";
import { logImportError, logImportPhase } from "@/lib/diagnostics";
import { isMeaningfulSentence } from "@/lib/import/is-meaningful-sentence";
import { runWithConcurrency } from "@/lib/import/run-with-concurrency";
import { computeContentHash } from "@/lib/hash/content-hash";
import { prisma } from "@/lib/prisma";
import { buildMinimalAnalysis } from "@/services/ai/build-minimal-analysis";
import type { AnalysisStatus } from "@/services/ai/schemas";
import type { SentencePipelineContext, TextPipelineResult, ImportSegmentStats } from "@/domain/pipeline";
import type { AIProvider } from "@/services/ai";
import { analyzeBatchWithKnowledge } from "@/services/knowledge";
import {
  applyQualityToAnalysis,
  sanitizeSentenceText,
  validateImportTextLexical,
} from "@/services/import-quality";
import type { ImportPipelineOptions, ImportRussianTextInput } from "@/services/import/types";
import { normalizeCategoryIds } from "@/content/categories";
import {
  isCollectionId,
  resolveCollectionIdFromLegacySource,
  type CollectionId,
} from "@/content/collections";
import { createImportRunMetrics } from "@/types/import-pipeline";

import {
  runCollocationsStage,
  runCulturalPointsStage,
  runExplanationsStage,
  runFixedExpressionsStage,
  runKnowledgeGraphStage,
  runPatternIndexStage,
  runLiteralTranslationStage,
  runMorphologyStage,
  runNaturalTranslationStage,
  runSegmentationStage,
  runSyntaxStage,
} from "./stages";
import {
  markSentenceEnrichmentFailed,
  markSentenceProcessing,
  runStorageUpdateStage,
} from "./stages/storage-stage";
import {
  countWordsInSegments,
  persistShellSentences,
  type ShellSegment,
} from "./persist-shell-sentences";

const DEFAULT_SENTENCE_CONCURRENCY = 4;
const DEFAULT_ANALYSIS_BATCH_SIZE = 12;

function resolveImportCollectionId(input: ImportRussianTextInput): CollectionId {
  if (input.collectionId && isCollectionId(input.collectionId)) {
    return input.collectionId;
  }
  return resolveCollectionIdFromLegacySource(input.source);
}

export type FastImportResult = {
  textId: string;
  sentenceCount: number;
  wordCount: number;
  warnings: string[];
  skippedDuplicate: boolean;
  enrichmentPending: boolean;
  segments: ShellSegment[];
  qualityReport?: Awaited<ReturnType<typeof validateImportTextLexical>>;
};

function createSentenceContext(
  textId: string,
  textTitle: string,
  position: number,
  rawRussianText: string,
  sentenceId: string,
): SentencePipelineContext {
  return {
    textId,
    textTitle,
    position,
    rawRussianText,
    russianText: rawRussianText,
    analysis: null,
    morphology: [],
    fixedExpressions: [],
    collocations: [],
    syntaxAnalysis: null,
    culturalNotes: [],
    sentenceId,
    formIdByPosition: new Map(),
    phraseIdByLabel: new Map(),
    stageResults: {},
    usedAi: false,
  };
}

function prepareSegments(
  sentenceTexts: string[],
  invalidSurfaces: string[],
): ShellSegment[] {
  const prepared: ShellSegment[] = [];

  for (let index = 0; index < sentenceTexts.length; index += 1) {
    const rawRussianText = sentenceTexts[index]!;
    const sanitizedText = sanitizeSentenceText(rawRussianText, invalidSurfaces);

    if (!isMeaningfulSentence(sanitizedText)) {
      continue;
    }

    prepared.push({
      sentenceIndex: index + 1,
      rawRussianText,
      sanitizedText,
      storagePosition: prepared.length,
    });
  }

  return prepared;
}

/**
 * Phase A — segment, persist Text + shell Sentences, return immediately.
 */
export async function runTextImportPipelineFast(
  input: ImportRussianTextInput,
  options?: ImportPipelineOptions,
): Promise<FastImportResult> {
  const contentHash = input.contentHash ?? computeContentHash(input.rawText);

  setImportPipelineMeta({
    title: input.title,
    rawTextLength: input.rawText.length,
  });

  if (options?.skipDuplicates !== false) {
    const existing = await prisma.text.findUnique({ where: { contentHash } });
    if (existing) {
      return {
        textId: existing.id,
        sentenceCount: 0,
        wordCount: 0,
        warnings: [`Doublon ignoré — texte déjà importé (${existing.title}).`],
        skippedDuplicate: true,
        enrichmentPending: false,
        segments: [],
      };
    }
  }

  const { sentences: sentenceTexts, cleanedText } = runSegmentationStage(input.rawText);
  if (sentenceTexts.length === 0) {
    throw new Error("Aucune phrase détectée dans le texte fourni.");
  }

  const qualityReport = await validateImportTextLexical(cleanedText);
  const preparedSegments = prepareSegments(sentenceTexts, qualityReport.invalidSurfaces);

  const warnings: string[] = [];
  if (qualityReport.suspiciousCount > 0 || qualityReport.invalidCount > 0) {
    warnings.push(
      `Qualité lexicale : ${qualityReport.knownCount} connus, ${qualityReport.unknownCount} nouveaux, ${qualityReport.suspiciousCount} suspects, ${qualityReport.invalidCount} ignorés.`,
    );
  }

  const text = await prisma.text.create({
    data: {
      ...(input.textId ? { id: input.textId } : {}),
      title: input.title,
      level: input.level,
      collectionId: resolveImportCollectionId(input),
      categoryIds: normalizeCategoryIds(input.categoryIds),
      contentHash,
    },
  });

  await persistShellSentences(text.id, preparedSegments);

  logImportPhase("runTextImportPipelineFast complete", {
    textId: text.id,
    sentenceCount: preparedSegments.length,
  });

  return {
    textId: text.id,
    sentenceCount: preparedSegments.length,
    wordCount: countWordsInSegments(preparedSegments),
    warnings,
    skippedDuplicate: false,
    enrichmentPending: preparedSegments.length > 0,
    segments: preparedSegments,
    qualityReport,
  };
}

/**
 * Phase B — AI analysis + graph enrichment for an already-persisted text.
 */
export async function enrichTextImport(
  input: ImportRussianTextInput,
  textId: string,
  segments: ShellSegment[],
  provider: AIProvider,
  options?: ImportPipelineOptions,
  qualityReport?: Awaited<ReturnType<typeof validateImportTextLexical>>,
): Promise<TextPipelineResult> {
  const metrics = options?.metrics ?? createImportRunMetrics();
  const warnings: string[] = [];

  const existingSentences = await prisma.sentence.findMany({
    where: { textId },
    orderBy: { position: "asc" },
    select: { id: true, position: true, russianText: true },
  });

  const sentenceIdByPosition = new Map(
    existingSentences.map((sentence) => [sentence.position, sentence.id]),
  );

  const lexicalReport =
    qualityReport ??
    (await validateImportTextLexical(runSegmentationStage(input.rawText).cleanedText));

  const analysisByText = await analyzeBatchWithKnowledge(
    segments.map((segment) => segment.sanitizedText),
    provider,
    {
      metrics,
      batchSize: options?.analysisBatchSize ?? DEFAULT_ANALYSIS_BATCH_SIZE,
    },
  );

  const translationTracker = new ImportTranslationTracker();
  const segmentStats: ImportSegmentStats = {
    total: segments.length,
    complete: 0,
    partial: 0,
    failed: 0,
    lost: 0,
  };

  let wordCount = 0;
  let phraseGroupCount = 0;
  let sentencesNeedingReview = 0;

  const sentenceConcurrency = options?.sentenceConcurrency ?? DEFAULT_SENTENCE_CONCURRENCY;

  await runWithConcurrency(segments, sentenceConcurrency, async (segment) => {
    setCurrentSentenceIndex(segment.sentenceIndex);

    const sentenceId = sentenceIdByPosition.get(segment.storagePosition);
    if (!sentenceId) {
      segmentStats.lost += 1;
      return;
    }

    await markSentenceProcessing(sentenceId);

    let analysis =
      analysisByText.get(segment.sanitizedText) ??
      buildMinimalAnalysis({
        russianText: segment.sanitizedText,
        status: "failed",
        reason: "Analyse indisponible après traitement groupé.",
      });

    analysis = applyQualityToAnalysis(analysis, lexicalReport);

    if (segment.sanitizedText !== segment.rawRussianText) {
      analysis = { ...analysis, russianText: segment.sanitizedText };
    }

    const chunkStatus: AnalysisStatus = analysis.analysisStatus ?? (
      analysis.words.length > 0 ? "complete" : "partial"
    );

    if (chunkStatus === "complete") {
      segmentStats.complete += 1;
    } else if (chunkStatus === "partial") {
      segmentStats.partial += 1;
    } else {
      segmentStats.failed += 1;
    }

    if (analysis.needsReview) {
      sentencesNeedingReview += 1;
    }

    if (analysis.russianText.trim() !== segment.rawRussianText.trim()) {
      warnings.push(
        `Phrase ${segment.sentenceIndex}: le texte renvoyé par l'IA diffère légèrement de l'original.`,
      );
    }

    let ctx = createSentenceContext(
      textId,
      input.title,
      segment.storagePosition,
      segment.rawRussianText,
      sentenceId,
    );
    ctx = runMorphologyStage(ctx, analysis);
    ctx = runFixedExpressionsStage(ctx, analysis);
    ctx = runCollocationsStage(ctx, analysis);
    ctx = runSyntaxStage(ctx, analysis);
    ctx = runExplanationsStage(ctx, analysis);
    ctx = runLiteralTranslationStage(ctx, analysis);
    ctx = runNaturalTranslationStage(ctx, analysis);
    ctx = { ...ctx, analysis };
    ctx = runCulturalPointsStage(ctx, analysis);

    try {
      const { ctx: storedCtx, output: storageOutput } = await runStorageUpdateStage(
        ctx,
        analysis,
        sentenceId,
      );
      const kgOutput = await runKnowledgeGraphStage(storedCtx, analysis, storageOutput);
      const patternOutput = await runPatternIndexStage(storedCtx, analysis, storageOutput);

      await translationTracker.recordSentence({
        sentenceIndex: segment.sentenceIndex,
        analysis,
        knowledgeConcepts: kgOutput.conceptsLinked,
      });

      wordCount += analysis.words.length;
      phraseGroupCount += storageOutput.phraseGroupCount;

      if (patternOutput.patternCount > 0) {
        logImportPhase("pattern index", {
          sentenceId,
          primaryPatternId: patternOutput.primaryPatternId,
          patternCount: patternOutput.patternCount,
        });
      }
    } catch (error) {
      translationTracker.recordWarning();
      segmentStats.lost += 1;
      await markSentenceEnrichmentFailed(
        sentenceId,
        error instanceof Error ? error.message : "Erreur d'enrichissement.",
      );
      logImportError("enrichment storage/graph", error, {
        sentenceIndex: segment.sentenceIndex,
        textId,
        sentenceId,
        preview: auditPreviewText(segment.sanitizedText),
      });
      recordPipelineFailure(
        "storage",
        "enrich-text-import.ts:storage",
        { sentenceIndex: segment.sentenceIndex, textId, sentenceId },
        error,
      );
      warnings.push(
        `Phrase ${segment.sentenceIndex}: enrichissement impossible — ${error instanceof Error ? error.message : "erreur"}.`,
      );
    }
  });

  setCurrentSentenceIndex(undefined);

  const sentenceCount = await prisma.sentence.count({ where: { textId } });

  logImportPhase("enrichTextImport complete", {
    textId,
    sentenceCount,
    wordCount,
    aiCalls: metrics.aiCalls,
    knowledgeHits: metrics.knowledgeHits,
    segmentStats,
  });

  translationTracker.logFinalSummary();

  return {
    textId,
    sentenceCount,
    wordCount,
    phraseGroupCount,
    sentencesNeedingReview,
    warnings,
    skippedDuplicate: false,
    aiCalls: metrics.aiCalls,
    knowledgeHits: metrics.knowledgeHits,
    knowledgeMisses: metrics.knowledgeMisses,
    qualityReport: lexicalReport,
    segmentStats,
    translationSummary: translationTracker.getSummary(),
  };
}

export type TextEnrichmentStatus = {
  textId: string;
  total: number;
  ready: number;
  pending: number;
  processing: number;
  failed: number;
  complete: boolean;
  estimatedSecondsRemaining: number | null;
};

export async function getTextEnrichmentStatus(textId: string): Promise<TextEnrichmentStatus | null> {
  const sentences = await prisma.sentence.findMany({
    where: { textId },
    select: { analysisState: true },
  });

  if (sentences.length === 0) {
    return null;
  }

  const counts = {
    ready: 0,
    pending: 0,
    processing: 0,
    failed: 0,
  };

  for (const sentence of sentences) {
    if (sentence.analysisState === "READY") {
      counts.ready += 1;
    } else if (sentence.analysisState === "PROCESSING") {
      counts.processing += 1;
    } else if (sentence.analysisState === "FAILED") {
      counts.failed += 1;
    } else {
      counts.pending += 1;
    }
  }

  const remaining = counts.pending + counts.processing;
  const complete = remaining === 0;

  return {
    textId,
    total: sentences.length,
    ready: counts.ready,
    pending: counts.pending,
    processing: counts.processing,
    failed: counts.failed,
    complete,
    estimatedSecondsRemaining: complete ? null : Math.max(1, Math.ceil(remaining * 0.75)),
  };
}
