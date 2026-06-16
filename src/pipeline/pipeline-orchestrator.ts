import {
  runImportPipelineAudit,
  setImportPipelineMeta,
} from "@/lib/diagnostics/import-pipeline-audit";
import type { TextPipelineResult } from "@/domain/pipeline";
import type { AIProvider } from "@/services/ai";
import type { ImportPipelineOptions, ImportRussianTextInput } from "@/services/import/types";

import {
  enrichTextImport,
  runTextImportPipelineFast,
} from "./enrich-text-import";

/**
 * Full import pipeline (blocking): fast persist + background-quality enrichment in one call.
 * Used by bulk import and CLI where completion must be awaited.
 */
export async function runTextImportPipeline(
  input: ImportRussianTextInput,
  provider: AIProvider,
  options?: ImportPipelineOptions,
): Promise<TextPipelineResult> {
  return runImportPipelineAudit(async () => {
    setImportPipelineMeta({
      title: input.title,
      rawTextLength: input.rawText.length,
    });

    const fast = await runTextImportPipelineFast(input, options);

    if (fast.skippedDuplicate) {
      return {
        textId: fast.textId,
        sentenceCount: 0,
        wordCount: 0,
        phraseGroupCount: 0,
        sentencesNeedingReview: 0,
        warnings: fast.warnings,
        skippedDuplicate: true,
        aiCalls: options?.metrics?.aiCalls ?? 0,
        knowledgeHits: options?.metrics?.knowledgeHits ?? 0,
        knowledgeMisses: options?.metrics?.knowledgeMisses ?? 0,
      };
    }

    if (!fast.enrichmentPending) {
      return {
        textId: fast.textId,
        sentenceCount: 0,
        wordCount: 0,
        phraseGroupCount: 0,
        sentencesNeedingReview: 0,
        warnings: fast.warnings,
        skippedDuplicate: false,
        aiCalls: 0,
        knowledgeHits: 0,
        knowledgeMisses: 0,
      };
    }

    return enrichTextImport(
      input,
      fast.textId,
      fast.segments,
      provider,
      options,
      fast.qualityReport,
    );
  });
}

export {
  enrichTextImport,
  getTextEnrichmentStatus,
  runTextImportPipelineFast,
  type FastImportResult,
  type TextEnrichmentStatus,
} from "./enrich-text-import";
