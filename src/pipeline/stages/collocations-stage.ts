import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { SentencePipelineContext } from "@/domain/pipeline";

/**
 * Stage 4 — Collocations: extract COLLOCATION phrase groups.
 * No AI.
 */
export function runCollocationsStage(
  ctx: SentencePipelineContext,
  analysis: SentenceAnalysisOutput,
): SentencePipelineContext {
  const collocations = analysis.phraseGroups.filter((g) => g.type === "COLLOCATION");
  return { ...ctx, collocations };
}
