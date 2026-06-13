import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { SentencePipelineContext, SyntaxAnalysis } from "@/domain/pipeline";

/**
 * Stage 5 — Syntax: extract or derive syntax analysis.
 * No AI — uses precomputed syntaxAnalysis or falls back to orderExplanation.
 */
export function runSyntaxStage(
  ctx: SentencePipelineContext,
  analysis: SentenceAnalysisOutput,
): SentencePipelineContext {
  const syntaxAnalysis: SyntaxAnalysis = analysis.syntaxAnalysis ?? {
    tokens: analysis.words.map((w) => ({
      position: w.position,
      original: w.original,
      lemma: w.lemma,
      partOfSpeech: w.partOfSpeech,
      headPosition: null,
      relation: null,
    })),
    structureExplanation: analysis.orderExplanation,
  };

  return { ...ctx, syntaxAnalysis };
}
