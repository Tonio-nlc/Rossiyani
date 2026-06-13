import { isExpressionType } from "@/domain/entities/expression";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { SentencePipelineContext } from "@/domain/pipeline";

/**
 * Stage 3 — Fixed expressions: extract FIXED_EXPRESSION and NATIVE_CONSTRUCTION groups.
 * No AI.
 */
export function runFixedExpressionsStage(
  ctx: SentencePipelineContext,
  analysis: SentenceAnalysisOutput,
): SentencePipelineContext {
  const fixedExpressions = analysis.phraseGroups.filter((g) => isExpressionType(g.type));
  return { ...ctx, fixedExpressions };
}
