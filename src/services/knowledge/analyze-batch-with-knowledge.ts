import {
  auditPipelineStep,
  recordPipelineStep,
} from "@/lib/diagnostics/import-pipeline-audit";
import { logImportPhase } from "@/lib/diagnostics";
import type { AIProvider } from "@/services/ai";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import { linguisticLibraryIndexer } from "@/services/linguistic-library";

import type { ImportRunMetrics } from "@/types/import-pipeline";

import { knowledgeLookupService } from "./knowledge-lookup-service";

export type AnalyzeBatchWithKnowledgeOptions = {
  metrics?: ImportRunMetrics;
  batchSize?: number;
};

const DEFAULT_BATCH_SIZE = 12;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

/**
 * Resolves analyses for many sentences: batch cache lookup → batch AI → parallel index.
 * Returns a map keyed by exact input russianText.
 */
export async function analyzeBatchWithKnowledge(
  russianTexts: string[],
  provider: AIProvider,
  options?: AnalyzeBatchWithKnowledgeOptions,
): Promise<Map<string, SentenceAnalysisOutput>> {
  const results = new Map<string, SentenceAnalysisOutput>();
  if (russianTexts.length === 0) {
    return results;
  }

  const batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE;
  const batches = chunk(russianTexts, batchSize);

  for (const batch of batches) {
    await processAnalysisBatch(batch, provider, results, options);
  }

  return results;
}

async function processAnalysisBatch(
  batch: string[],
  provider: AIProvider,
  results: Map<string, SentenceAnalysisOutput>,
  options?: AnalyzeBatchWithKnowledgeOptions,
): Promise<void> {
  const lookups = await auditPipelineStep(
    "knowledgeLookup",
    "analyze-batch-with-knowledge.ts:lookup",
    { sentenceCount: batch.length },
    () => knowledgeLookupService.lookupSentencesBatch(batch),
    (lookupResults) => ({
      hits: lookupResults.filter((item) => item.hit && item.complete).length,
      misses: lookupResults.filter((item) => !item.hit || !item.complete).length,
    }),
  );

  const aiNeeded: string[] = [];

  for (let index = 0; index < batch.length; index += 1) {
    const text = batch[index]!;
    const lookup = lookups[index]!;

    if (lookup.hit && lookup.complete && lookup.analysis) {
      results.set(text, lookup.analysis);
      if (options?.metrics) {
        options.metrics.knowledgeHits += 1;
        options.metrics.sentencesProcessed += 1;
      }
      recordPipelineStep({
        step: "aiRequest",
        status: "skipped",
        location: "analyze-batch-with-knowledge.ts:cache-hit",
        input: { preview: text.slice(0, 80) },
        output: { skipped: true },
      });
      continue;
    }

    aiNeeded.push(text);
    if (options?.metrics) {
      options.metrics.knowledgeMisses += 1;
    }
  }

  if (aiNeeded.length === 0) {
    return;
  }

  logImportPhase("batch AI analysis", {
    batchSize: aiNeeded.length,
    cacheHits: batch.length - aiNeeded.length,
  });

  if (options?.metrics) {
    options.metrics.aiCalls += 1;
    options.metrics.sentencesProcessed += aiNeeded.length;
  }

  const analyses = await provider.analyzeSentencesBatch(
    aiNeeded.map((russianText) => ({ russianText })),
  );

  await Promise.all(
    analyses.map(async (analysis, index) => {
      const sourceText = aiNeeded[index] ?? analysis.russianText;
      try {
        await linguisticLibraryIndexer.indexFromAnalysis(analysis);
      } catch (error) {
        logImportPhase("indexFromAnalysis skipped after batch analysis", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
      results.set(sourceText, { ...analysis, russianText: sourceText });
    }),
  );
}
