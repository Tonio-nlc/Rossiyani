import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { SentencePipelineContext } from "@/domain/pipeline";

/**
 * Stage 6 — Explanations: word-level pedagogical explanations are already in morphology.
 * No AI — identity pass that confirms analysis is present.
 */
export function runExplanationsStage(
  ctx: SentencePipelineContext,
  analysis: SentenceAnalysisOutput,
): SentencePipelineContext {
  return {
    ...ctx,
    morphology: analysis.words,
  };
}
