import type {
  BuildReaderPatternExperienceInput,
  ReaderPatternExperienceView,
} from "@/types/reader-pattern-experience";
import type { OrchestratorSessionState } from "@/types/learning-orchestrator";

import {
  buildOrchestratorInput,
  decidePedagogicalIntervention,
  mapDecisionToPatternEcho,
  mapDecisionToReaderExperience,
  mapDecisionToSentenceInsightGate,
} from "@/services/learning-orchestrator";
import { shouldShowPatternEcho } from "@/services/learning-orchestrator/encounter-signals";

export type BuildReaderPatternExperienceOptions = BuildReaderPatternExperienceInput & {
  sentence?: {
    sentenceId: string;
    textId: string;
    textTitle: string;
    isFirstReadOfText?: boolean;
  };
  session?: OrchestratorSessionState;
  secondaryPatternIds?: string[];
  preferences?: { immersiveReading?: boolean };
};

function defaultSession(): OrchestratorSessionState {
  return {
    sessionId: "ephemeral",
    startedAt: Date.now(),
    insightsDelivered: 0,
    comprehensionsDelivered: 0,
    patternsIntroducedThisSession: [],
    lastIntroducedPatternId: null,
    lastIntroducedAt: null,
  };
}

/**
 * Builds the Reader pattern experience via the Learning Orchestrator.
 */
export function buildReaderPatternExperience(
  input: BuildReaderPatternExperienceOptions,
): ReaderPatternExperienceView {
  const orchestratorInput = buildOrchestratorInput({
    ...input,
    sentence: {
      sentenceId: input.sentence?.sentenceId ?? "unknown",
      textId: input.sentence?.textId ?? "unknown",
      textTitle: input.sentence?.textTitle ?? "",
      wordPosition: input.wordPosition,
      naturalTranslation: input.anchorText ?? undefined,
      isFirstReadOfText: input.sentence?.isFirstReadOfText ?? false,
    },
    session: input.session ?? defaultSession(),
    secondaryPatternIds: input.secondaryPatternIds ?? [],
  });

  const decision = decidePedagogicalIntervention(orchestratorInput);
  return mapDecisionToReaderExperience(decision, input.pattern, input.anchorText);
}

export function buildReaderPatternSentenceInsight(input: {
  naturalTranslation: string;
  patternContext: { primaryPatternId: string | null } | null;
  pattern?: BuildReaderPatternExperienceOptions["pattern"];
  instance?: BuildReaderPatternExperienceOptions["instance"];
  encounter: import("@/types/reader-pattern-experience").PatternEncounterState | null;
  session?: OrchestratorSessionState;
  sentence?: BuildReaderPatternExperienceOptions["sentence"];
}): {
  available: boolean;
  softGate: boolean;
  body: string;
} {
  if (!input.patternContext?.primaryPatternId) {
    return { available: true, softGate: false, body: "" };
  }

  const orchestratorInput = buildOrchestratorInput({
    pattern: input.pattern ?? null,
    instance: input.instance ?? null,
    secondaryPatternCount: 0,
    wordPosition: null,
    interaction: "explore_sentence",
    encounter: input.encounter,
    anchorText: input.naturalTranslation,
    sentence: {
      sentenceId: input.sentence?.sentenceId ?? "unknown",
      textId: input.sentence?.textId ?? "unknown",
      textTitle: input.sentence?.textTitle ?? "",
      naturalTranslation: input.naturalTranslation,
      isFirstReadOfText: input.sentence?.isFirstReadOfText ?? false,
    },
    session: input.session ?? defaultSession(),
  });

  const decision = decidePedagogicalIntervention(orchestratorInput);
  return mapDecisionToSentenceInsightGate(
    decision,
    input.naturalTranslation,
    Boolean(input.patternContext.primaryPatternId),
  );
}

export { shouldShowPatternEcho, mapDecisionToPatternEcho };
export { decidePedagogicalIntervention } from "@/services/learning-orchestrator";
