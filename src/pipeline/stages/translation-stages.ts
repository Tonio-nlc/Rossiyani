import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { SentencePipelineContext } from "@/domain/pipeline";

/** Stage 7 — Literal translation. No AI. */
export function runLiteralTranslationStage(
  ctx: SentencePipelineContext,
  analysis: SentenceAnalysisOutput,
): SentencePipelineContext {
  return {
    ...ctx,
    analysis: {
      ...analysis,
      literalTranslation: analysis.literalTranslation,
    },
  };
}

/** Stage 8 — Natural translation. No AI. */
export function runNaturalTranslationStage(
  ctx: SentencePipelineContext,
  analysis: SentenceAnalysisOutput,
): SentencePipelineContext {
  return {
    ...ctx,
    analysis: {
      ...analysis,
      naturalTranslation: analysis.naturalTranslation,
    },
  };
}
