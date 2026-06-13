import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { SentencePipelineContext } from "@/domain/pipeline";

/**
 * Stage 2 — Morphology: extract word-level morphological analysis.
 * No AI — decomposes precomputed analysis.
 */
export function runMorphologyStage(
  ctx: SentencePipelineContext,
  analysis: SentenceAnalysisOutput,
): SentencePipelineContext {
  return {
    ...ctx,
    morphology: [...analysis.words].sort((a, b) => a.position - b.position),
  };
}
