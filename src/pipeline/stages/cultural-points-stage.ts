import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { CulturalNote, SentencePipelineContext } from "@/domain/pipeline";

/**
 * Stage 9 — Cultural points: extract cultural notes from analysis.
 * No AI — uses culturalNotes array or derives from nativeUsageNotes.
 */
export function runCulturalPointsStage(
  ctx: SentencePipelineContext,
  analysis: SentenceAnalysisOutput,
): SentencePipelineContext {
  const culturalNotes: CulturalNote[] =
    analysis.culturalNotes.length > 0
      ? analysis.culturalNotes
      : analysis.nativeUsageNotes.trim()
        ? [{ title: "Usage natif", explanation: analysis.nativeUsageNotes }]
        : [];

  return { ...ctx, culturalNotes };
}
