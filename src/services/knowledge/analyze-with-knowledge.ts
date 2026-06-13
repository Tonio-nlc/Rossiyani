import {
  auditPipelineStep,
  auditPreviewText,
  recordPipelineStep,
} from "@/lib/diagnostics/import-pipeline-audit";
import { logImportPhase } from "@/lib/diagnostics";
import type { AIProvider } from "@/services/ai";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import { linguisticLibraryIndexer } from "@/services/linguistic-library";

import type { ImportRunMetrics } from "@/types/import-pipeline";

import { knowledgeLookupService } from "./knowledge-lookup-service";

export type AnalyzeWithKnowledgeOptions = {
  metrics?: ImportRunMetrics;
  sentenceIndex?: number;
};

/**
 * Orchestrates: KnowledgeLookup → AI (if miss) → LinguisticLibrary index.
 * Single entry point between parser and AIProvider for import.
 */
export async function analyzeWithKnowledge(
  russianText: string,
  provider: AIProvider,
  options?: AnalyzeWithKnowledgeOptions,
): Promise<SentenceAnalysisOutput> {
  const sentenceIndex = options?.sentenceIndex;
  const textPreview = auditPreviewText(russianText);

  const lookup = await auditPipelineStep(
    "knowledgeLookup",
    "analyze-with-knowledge.ts:32",
    {
      sentenceIndex,
      russianTextLength: russianText.length,
      preview: textPreview,
    },
    () => knowledgeLookupService.lookupSentence(russianText),
    (result) => ({
      hit: result.hit,
      complete: result.complete,
      source: result.source,
    }),
  );

  if (lookup.hit && lookup.complete && lookup.analysis) {
    logImportPhase("knowledge cache hit — skipping AI", { russianText });
    if (options?.metrics) {
      options.metrics.knowledgeHits += 1;
      options.metrics.sentencesProcessed += 1;
    }
    recordPipelineStep({
      step: "aiRequest",
      status: "skipped",
      location: "analyze-with-knowledge.ts:48",
      sentenceIndex,
      input: { reason: "knowledge cache hit" },
      output: { skipped: true },
    });
    recordPipelineStep({
      step: "parseAnalysisResponse",
      status: "skipped",
      location: "analyze-with-knowledge.ts:55",
      sentenceIndex,
      input: { reason: "knowledge cache hit" },
      output: { skipped: true },
    });
    return lookup.analysis;
  }

  logImportPhase("knowledge cache miss — calling AI", {
    russianText,
    partialHit: lookup.hit,
  });

  if (options?.metrics) {
    options.metrics.knowledgeMisses += 1;
    options.metrics.aiCalls += 1;
    options.metrics.sentencesProcessed += 1;
  }

  const analysis = await provider.analyzeSentence({ russianText });

  logImportPhase("chunk analysis from provider", {
    sentenceIndex,
    status: analysis.analysisStatus ?? (analysis.words.length > 0 ? "complete" : "partial"),
    wordCount: analysis.words.length,
    phraseGroupCount: analysis.phraseGroups.length,
    retry_count: 0,
    saved: true,
  });

  try {
    await auditPipelineStep(
      "indexFromAnalysis",
      "analyze-with-knowledge.ts:93",
      {
        sentenceIndex,
        wordCount: analysis.words.length,
      },
      () => linguisticLibraryIndexer.indexFromAnalysis(analysis),
      () => ({ indexed: true }),
    );
  } catch (error) {
    logImportPhase("indexFromAnalysis skipped after partial analysis", {
      sentenceIndex,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return analysis;
}
