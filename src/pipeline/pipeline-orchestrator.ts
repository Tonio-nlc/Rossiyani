import {
  auditPipelineStep,
  auditPipelineStepSync,
  auditPreviewText,
  buildImportFailureMessage,
  formatPipelineAuditReport,
  recordPipelineFailure,
  recordPipelineStep,
  runImportPipelineAudit,
  setCurrentSentenceIndex,
  setImportPipelineMeta,
} from "@/lib/diagnostics/import-pipeline-audit";
import { ImportTranslationTracker } from "@/lib/diagnostics/import-translation-tracker";
import { logImportError, logImportPhase, logPrismaError } from "@/lib/diagnostics";
import { isMeaningfulSentence } from "@/lib/import/is-meaningful-sentence";
import { computeContentHash } from "@/lib/hash/content-hash";
import { prisma } from "@/lib/prisma";
import { buildMinimalAnalysis } from "@/services/ai/build-minimal-analysis";
import type { AnalysisStatus } from "@/services/ai/schemas";
import type { SentencePipelineContext, TextPipelineResult, ImportSegmentStats } from "@/domain/pipeline";
import type { AIProvider } from "@/services/ai";
import { analyzeWithKnowledge } from "@/services/knowledge";
import {
  applyQualityToAnalysis,
  sanitizeSentenceText,
  validateImportTextLexical,
} from "@/services/import-quality";
import type { ImportPipelineOptions, ImportRussianTextInput } from "@/services/import/types";
import { createImportRunMetrics } from "@/types/import-pipeline";

import {
  runCollocationsStage,
  runCulturalPointsStage,
  runExplanationsStage,
  runFixedExpressionsStage,
  runKnowledgeGraphStage,
  runLiteralTranslationStage,
  runMorphologyStage,
  runNaturalTranslationStage,
  runSegmentationStage,
  runStorageStage,
  runSyntaxStage,
} from "./stages";

const DEFAULT_DELAY_MS = 300;

function createSentenceContext(
  textId: string,
  textTitle: string,
  position: number,
  rawRussianText: string,
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
    sentenceId: null,
    formIdByPosition: new Map(),
    phraseIdByLabel: new Map(),
    stageResults: {},
    usedAi: false,
  };
}

/**
 * Full import pipeline: Text → Segmentation → … → Knowledge Graph.
 * AI is invoked only inside analyzeWithKnowledge (cache miss).
 */
export async function runTextImportPipeline(
  input: ImportRussianTextInput,
  provider: AIProvider,
  options?: ImportPipelineOptions,
): Promise<TextPipelineResult> {
  return runImportPipelineAudit(async () => {
    const metrics = options?.metrics ?? createImportRunMetrics();
    const contentHash = input.contentHash ?? computeContentHash(input.rawText);

    setImportPipelineMeta({
      title: input.title,
      rawTextLength: input.rawText.length,
    });

    recordPipelineStep({
      step: "import",
      status: "success",
      location: "pipeline-orchestrator.ts:88",
      input: {
        title: input.title,
        level: input.level,
        source: input.source ?? null,
        provider: provider.id,
        rawTextLength: input.rawText.length,
        preview: auditPreviewText(input.rawText),
      },
      output: {
        contentHash,
      },
    });

    if (options?.skipDuplicates !== false) {
      const existing = await prisma.text.findUnique({ where: { contentHash } });
      if (existing) {
        logImportPhase("duplicate text skipped", { contentHash, textId: existing.id });
        return {
          textId: existing.id,
          sentenceCount: 0,
          wordCount: 0,
          phraseGroupCount: 0,
          sentencesNeedingReview: 0,
          warnings: [`Doublon ignoré — texte déjà importé (${existing.title}).`],
          skippedDuplicate: true,
          aiCalls: metrics.aiCalls,
          knowledgeHits: metrics.knowledgeHits,
          knowledgeMisses: metrics.knowledgeMisses,
        };
      }
    }

    logImportPhase("runTextImportPipeline start", {
      title: input.title,
      level: input.level,
      provider: provider.id,
      contentHash,
    });

    const { sentences: sentenceTexts, cleanedText } = runSegmentationStage(input.rawText);

    setImportPipelineMeta({ sentenceCount: sentenceTexts.length });

    if (sentenceTexts.length === 0) {
      recordPipelineStep({
        step: "segmentSentences",
        status: "failure",
        location: "pipeline-orchestrator.ts:131",
        output: { sentenceCount: 0 },
        error: { message: "Aucune phrase détectée dans le texte fourni." },
      });
      throw new Error(buildImportFailureMessage("Aucune phrase détectée dans le texte fourni."));
    }

    const qualityReport = await auditPipelineStep(
      "lexicalValidation",
      "pipeline-orchestrator.ts:140",
      { cleanedTextLength: cleanedText.length },
      () => validateImportTextLexical(cleanedText),
      (report) => ({
        knownCount: report.knownCount,
        unknownCount: report.unknownCount,
        suspiciousCount: report.suspiciousCount,
        invalidCount: report.invalidCount,
      }),
    );

    const warnings: string[] = [];
    if (qualityReport.suspiciousCount > 0 || qualityReport.invalidCount > 0) {
      warnings.push(
        `Qualité lexicale : ${qualityReport.knownCount} connus, ${qualityReport.unknownCount} nouveaux, ${qualityReport.suspiciousCount} suspects, ${qualityReport.invalidCount} ignorés.`,
      );
    }
    let wordCount = 0;
    let phraseGroupCount = 0;
    let sentencesNeedingReview = 0;
    const translationTracker = new ImportTranslationTracker();
    const segmentStats: ImportSegmentStats = {
      total: sentenceTexts.length,
      complete: 0,
      partial: 0,
      failed: 0,
      lost: 0,
    };

    let text;
    try {
      text = await auditPipelineStep(
        "textCreate",
        "pipeline-orchestrator.ts:164",
        { title: input.title, level: input.level, contentHash },
        () =>
          prisma.text.create({
            data: {
              title: input.title,
              level: input.level,
              source: input.source ?? null,
              contentHash,
            },
          }),
        (created) => ({ textId: created.id, saved: true }),
      );
    } catch (error) {
      logPrismaError("prisma.text.create", error, { title: input.title });
      throw error;
    }

    const delayMs = options?.delayBetweenSentencesMs ?? DEFAULT_DELAY_MS;
    let storedPosition = 0;

    for (let i = 0; i < sentenceTexts.length; i++) {
      const russianText = sentenceTexts[i]!;
      const sentenceIndex = i + 1;
      setCurrentSentenceIndex(sentenceIndex);

      if (storedPosition > 0 && delayMs > 0) {
        await sleep(delayMs);
      }

      const sanitizedText = auditPipelineStepSync(
        "sanitizeSentence",
        "pipeline-orchestrator.ts:196",
        {
          sentenceIndex,
          russianTextLength: russianText.length,
          preview: auditPreviewText(russianText),
          invalidSurfaceCount: qualityReport.invalidSurfaces.length,
        },
        () => sanitizeSentenceText(russianText, qualityReport.invalidSurfaces),
        (result) => ({
          sanitizedLength: result.length,
          preview: auditPreviewText(result),
          changed: result !== russianText,
        }),
      );

      if (!isMeaningfulSentence(sanitizedText)) {
        translationTracker.recordSkippedSegment();
        logImportPhase("segment skipped — not meaningful", {
          sentenceIndex,
          preview: auditPreviewText(sanitizedText),
        });
        recordPipelineStep({
          step: "analyzeWithKnowledge",
          status: "skipped",
          location: "pipeline-orchestrator.ts:228",
          sentenceIndex,
          input: { reason: "meaningless segment" },
          output: { skipped: true },
        });
        continue;
      }

      let analysis;
      try {
        analysis = await analyzeWithKnowledge(sanitizedText, provider, {
          metrics,
          sentenceIndex,
        });
      } catch (error) {
        logImportError("analyzeWithKnowledge", error, {
          sentenceIndex,
          russianText: sanitizedText,
        });
        recordPipelineFailure(
          "analyzeWithKnowledge",
          "pipeline-orchestrator.ts:218",
          { sentenceIndex, russianText: auditPreviewText(sanitizedText) },
          error,
        );
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        warnings.push(`Phrase ${sentenceIndex}: analyse IA en échec — enregistrement partiel.`);
        analysis = buildMinimalAnalysis({
          russianText: sanitizedText,
          status: "failed",
          reason: message,
        });
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

      logImportPhase("chunk import status", {
        chunk: sentenceIndex,
        status: chunkStatus,
        reason: analysis.words.length === 0 ? "words_empty" : undefined,
        wordCount: analysis.words.length,
        saved: true,
      });

      analysis = applyQualityToAnalysis(analysis, qualityReport);
      recordPipelineStep({
        step: "applyQuality",
        status: "success",
        location: "pipeline-orchestrator.ts:232",
        sentenceIndex,
        input: { wordCount: analysis.words.length },
        output: { needsReview: analysis.needsReview ?? false },
      });

      if (sanitizedText !== russianText) {
        analysis = { ...analysis, russianText: sanitizedText };
      }

      if (analysis.needsReview) {
        sentencesNeedingReview += 1;
      }

      if (analysis.russianText.trim() !== russianText.trim()) {
        warnings.push(
          `Phrase ${sentenceIndex}: le texte renvoyé par l'IA diffère légèrement de l'original.`,
        );
      }

      let ctx = createSentenceContext(text.id, input.title, storedPosition, russianText);
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
        const { ctx: storedCtx, output: storageOutput } = await runStorageStage(ctx, analysis);
        const kgOutput = await runKnowledgeGraphStage(storedCtx, analysis, storageOutput);

        await translationTracker.recordSentence({
          sentenceIndex,
          analysis,
          knowledgeConcepts: kgOutput.conceptsLinked,
        });

        storedPosition += 1;
        wordCount += analysis.words.length;
        phraseGroupCount += storageOutput.phraseGroupCount;
      } catch (error) {
        translationTracker.recordWarning();
        segmentStats.lost += 1;
        if (chunkStatus === "complete") {
          segmentStats.complete -= 1;
        } else if (chunkStatus === "partial") {
          segmentStats.partial -= 1;
        } else {
          segmentStats.failed -= 1;
        }
        logImportError("pipeline storage/graph", error, {
          sentenceIndex,
          textId: text.id,
        });
        recordPipelineFailure(
          "storage",
          "pipeline-orchestrator.ts:278",
          { sentenceIndex, textId: text.id },
          error,
        );
        warnings.push(`Phrase ${sentenceIndex}: enregistrement impossible — ${error instanceof Error ? error.message : "erreur"}.`);
      }
    }

    setCurrentSentenceIndex(undefined);

    const sentenceCount = await prisma.sentence.count({ where: { textId: text.id } });
    setImportPipelineMeta({ storedSentenceCount: sentenceCount });

    if (sentenceCount === 0 && sentenceTexts.length > 0) {
      logImportPhase("finalize: emergency persist — no sentences saved", {
        textId: text.id,
        segmentCount: sentenceTexts.length,
      });
      for (let i = 0; i < sentenceTexts.length; i++) {
        const emergencyText = sentenceTexts[i]!.trim();
        if (!emergencyText) {
          continue;
        }
        const emergencyAnalysis = buildMinimalAnalysis({
          russianText: emergencyText,
          status: "failed",
          reason: "Enregistrement d'urgence — analyse indisponible.",
        });
        try {
          let ctx = createSentenceContext(text.id, input.title, storedPosition, emergencyText);
          ctx = { ...ctx, analysis: emergencyAnalysis };
          ctx = runMorphologyStage(ctx, emergencyAnalysis);
          ctx = runFixedExpressionsStage(ctx, emergencyAnalysis);
          ctx = runCollocationsStage(ctx, emergencyAnalysis);
          ctx = runSyntaxStage(ctx, emergencyAnalysis);
          ctx = runExplanationsStage(ctx, emergencyAnalysis);
          ctx = runLiteralTranslationStage(ctx, emergencyAnalysis);
          ctx = runNaturalTranslationStage(ctx, emergencyAnalysis);
          ctx = runCulturalPointsStage(ctx, emergencyAnalysis);
          const { ctx: storedCtx, output: storageOutput } = await runStorageStage(
            ctx,
            emergencyAnalysis,
          );
          await runKnowledgeGraphStage(storedCtx, emergencyAnalysis, storageOutput);
          storedPosition += 1;
          segmentStats.failed += 1;
          warnings.push(`Segment ${i + 1}: enregistré en mode dégradé.`);
        } catch (emergencyError) {
          segmentStats.lost += 1;
          logImportError("emergency persist", emergencyError, { index: i + 1, textId: text.id });
        }
      }
    }

    const finalSentenceCount = await prisma.sentence.count({ where: { textId: text.id } });

    if (finalSentenceCount === 0) {
      await prisma.text.delete({ where: { id: text.id } }).catch(() => undefined);
      recordPipelineStep({
        step: "finalize",
        status: "failure",
        location: "pipeline-orchestrator.ts:finalize",
        output: {
          segmentedSentences: sentenceTexts.length,
          storedSentences: 0,
          segmentStats,
          warnings,
        },
        error: {
          message: "Aucun segment n'a pu être enregistré (erreur base de données).",
        },
      });
      console.error(formatPipelineAuditReport());
      throw new Error(
        buildImportFailureMessage(
          "Import impossible : échec d'enregistrement en base de données.",
        ),
      );
    }

    if (segmentStats.partial > 0 || segmentStats.failed > 0) {
      warnings.unshift(
        `Import terminé avec avertissements : ${segmentStats.complete} segment(s) complet(s), ${segmentStats.partial} partiel(s), ${segmentStats.failed} dégradé(s), ${segmentStats.lost} perdu(s).`,
      );
    }

    logImportPhase("runTextImportPipeline complete", {
      textId: text.id,
      sentenceCount: finalSentenceCount,
      wordCount,
      aiCalls: metrics.aiCalls,
      knowledgeHits: metrics.knowledgeHits,
      segmentStats,
      translationSummary: translationTracker.getSummary(),
    });

    translationTracker.logFinalSummary();

    recordPipelineStep({
      step: "finalize",
      status: "success",
      location: "pipeline-orchestrator.ts:finalize",
      output: {
        storedSentences: finalSentenceCount,
        segmentStats,
      },
    });

    return {
      textId: text.id,
      sentenceCount: finalSentenceCount,
      wordCount,
      phraseGroupCount,
      sentencesNeedingReview,
      warnings,
      skippedDuplicate: false,
      aiCalls: metrics.aiCalls,
      knowledgeHits: metrics.knowledgeHits,
      knowledgeMisses: metrics.knowledgeMisses,
      qualityReport,
      segmentStats,
      translationSummary: translationTracker.getSummary(),
    };
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
