import { auditPipelineStep } from "@/lib/diagnostics/import-pipeline-audit";
import { knowledgeGraphService } from "@/services/knowledge-graph";
import { linkSentenceToGraph } from "@/services/knowledge-graph/link-sentence-to-graph";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { KnowledgeGraphOutput, SentencePipelineContext, StorageOutput } from "@/domain/pipeline";

/**
 * Stage 11 — Knowledge Graph: merge occurrences and link graph relations.
 * No AI.
 */
export async function runKnowledgeGraphStage(
  ctx: SentencePipelineContext,
  analysis: SentenceAnalysisOutput,
  storage: StorageOutput,
): Promise<KnowledgeGraphOutput> {
  return auditPipelineStep(
    "knowledgeGraph",
    "knowledge-graph-stage.ts:16",
    {
      sentenceIndex: ctx.position + 1,
      sentenceId: storage.sentenceId,
      wordCount: storage.wordIds.length,
    },
    async () => {
      const mergeResult = await knowledgeGraphService.mergeOccurrence({
        analysis,
        textId: ctx.textId,
        textTitle: ctx.textTitle,
        sentenceId: storage.sentenceId,
        words: storage.wordIds.map((w) => ({
          id: w.id,
          position: w.position,
          original: w.original,
        })),
      });

      const linkResult = await linkSentenceToGraph({
        sentenceId: storage.sentenceId,
        analysis,
      });

      return {
        occurrencesCreated: mergeResult.occurrencesCreated,
        occurrencesSkipped: mergeResult.occurrencesSkipped,
        phraseOccurrencesCreated: mergeResult.phraseOccurrencesCreated,
        conceptsLinked: mergeResult.conceptsLinked + linkResult.conceptSentenceLinks,
        lemmaPhraseLinks: linkResult.lemmaPhraseLinks,
        conceptSentenceLinks: linkResult.conceptSentenceLinks,
        phraseSentenceLinks: linkResult.phraseSentenceLinks,
      };
    },
    (result) => ({
      occurrencesCreated: result.occurrencesCreated,
      occurrencesSkipped: result.occurrencesSkipped,
      conceptsLinked: result.conceptsLinked,
    }),
  );
}
