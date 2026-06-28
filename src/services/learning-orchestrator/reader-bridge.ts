import type { ReaderTextData } from "@/features/texts";
import type { OrchestratorInput } from "@/types/learning-orchestrator";
import type { PatternEncounterState } from "@/types/reader-pattern-experience";

export function buildOrchestratorInputFromReader(input: {
  text: ReaderTextData;
  sentenceId: string;
  interaction: OrchestratorInput["interaction"];
  wordPosition?: number | null;
  naturalTranslation?: string;
  encounter: PatternEncounterState | null;
  session: OrchestratorInput["session"];
  isFirstReadOfText?: boolean;
  immersiveReading?: boolean;
}): OrchestratorInput {
  const sentenceContext = input.text.patternSlice.bySentenceId[input.sentenceId];
  const primaryPatternId = sentenceContext?.primaryPatternId ?? null;
  const pattern = primaryPatternId
    ? (input.text.patternSlice.patterns[primaryPatternId] ?? null)
    : null;
  const instance = sentenceContext?.instance ?? null;

  return {
    interaction: input.interaction,
    sentence: {
      sentenceId: input.sentenceId,
      textId: input.text.id,
      textTitle: input.text.title,
      wordPosition: input.wordPosition ?? null,
      naturalTranslation: input.naturalTranslation,
      isFirstReadOfText: input.isFirstReadOfText ?? false,
    },
    primaryPattern:
      pattern && instance && primaryPatternId
        ? { patternId: primaryPatternId, pattern, instance }
        : null,
    secondaryPatternIds: sentenceContext?.secondaryPatternIds ?? [],
    encounter: input.encounter,
    session: input.session,
    preferences: input.immersiveReading ? { immersiveReading: true } : undefined,
  };
}
