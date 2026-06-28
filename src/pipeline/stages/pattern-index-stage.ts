import { auditPipelineStep } from "@/lib/diagnostics/import-pipeline-audit";
import type { SentencePipelineContext, StorageOutput } from "@/domain/pipeline";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import { getPatternCatalogService } from "@/services/patterns";
import {
  indexPatternInstances,
  persistPatternInstances,
  resolveIndexerKnowledgeContext,
} from "@/services/patterns/indexer";

export type PatternIndexOutput = {
  patternCount: number;
  primaryPatternId: string | null;
  secondaryPatternIds: string[];
  instancesCreated: number;
  instancesUpdated: number;
  instancesRemoved: number;
};

/**
 * Stage 12 — Pattern Instance Indexer: detect LP in analyzed sentences and persist.
 * No AI. Runs after Knowledge Graph merge.
 */
export async function runPatternIndexStage(
  ctx: SentencePipelineContext,
  analysis: SentenceAnalysisOutput,
  storage: StorageOutput,
): Promise<PatternIndexOutput> {
  return auditPipelineStep(
    "pattern-index",
    "pattern-index-stage.ts:24",
    {
      sentenceIndex: ctx.position + 1,
      sentenceId: storage.sentenceId,
      wordCount: analysis.words.length,
    },
    async () => {
      const catalog = await getPatternCatalogService();
      const knowledgeContext = await resolveIndexerKnowledgeContext(analysis, storage);

      const index = indexPatternInstances({
        sentenceId: storage.sentenceId,
        textId: ctx.textId,
        analysis,
        catalog,
        knowledgeContext,
      });

      const persistResult = await persistPatternInstances(index);

      return {
        patternCount: index.instances.length,
        primaryPatternId: index.primaryPatternId,
        secondaryPatternIds: index.secondaryPatternIds,
        instancesCreated: persistResult.instancesCreated,
        instancesUpdated: persistResult.instancesUpdated,
        instancesRemoved: persistResult.instancesRemoved,
      };
    },
    (result) => ({
      patternCount: result.patternCount,
      primaryPatternId: result.primaryPatternId,
    }),
  );
}
