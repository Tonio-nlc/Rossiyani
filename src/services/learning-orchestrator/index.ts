import type { BuildReaderPatternExperienceInput } from "@/types/reader-pattern-experience";
import type { OrchestratorInput } from "@/types/learning-orchestrator";

import { decidePedagogicalIntervention } from "./decide";
import {
  mapDecisionToPatternEcho,
  mapDecisionToReaderExperience,
  mapDecisionToSentenceInsightGate,
} from "./map-to-reader";

export function buildOrchestratorInput(
  input: BuildReaderPatternExperienceInput & {
    sentence: OrchestratorInput["sentence"];
    session: OrchestratorInput["session"];
    secondaryPatternIds?: string[];
    preferences?: OrchestratorInput["preferences"];
  },
): OrchestratorInput {
  return {
    interaction: input.interaction,
    sentence: input.sentence,
    primaryPattern:
      input.pattern && input.instance
        ? {
            patternId: input.pattern.id,
            pattern: input.pattern,
            instance: input.instance,
          }
        : null,
    secondaryPatternIds: input.secondaryPatternIds ?? [],
    encounter: input.encounter,
    session: input.session,
    preferences: input.preferences,
  };
}

export { decidePedagogicalIntervention } from "./decide";
export {
  isInsightReady,
  isSecondContact,
  isFirstExploration,
  shouldShowPatternEcho,
  isTokenInPatternInstance,
  familiarityScore,
} from "./encounter-signals";
export {
  getOrchestratorSession,
  resetOrchestratorSession,
  recordOrchestratorOutcome,
  isShortSession,
  isSessionInsightSaturated,
  isSessionComprehensionSaturated,
  isNoveltyBlockedForPattern,
  actionConsumesNoveltyBudget,
} from "./session-store";
export {
  mapDecisionToReaderExperience,
  mapDecisionToReaderDepth,
  mapDecisionToSentenceInsightGate,
  mapDecisionToPatternEcho,
} from "./map-to-reader";
export { mapDecisionToVocabularyExperience } from "./map-to-vocabulary";
export { buildOrchestratorInputFromReader } from "./reader-bridge";

export type {
  PedagogicalAction,
  PedagogicalDecision,
  PedagogicalDecisionReason,
  PedagogicalReasonCode,
  OrchestratorInput,
  OrchestratorSessionState,
  OrchestratorInteraction,
  OrchestratorPreferences,
} from "@/types/learning-orchestrator";

export { ORCHESTRATOR_LIMITS } from "@/types/learning-orchestrator";
