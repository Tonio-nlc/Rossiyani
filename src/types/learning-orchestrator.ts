import type { ExplanationDepth } from "@/types/patterns";
import type {
  PatternEncounterState,
  ReaderPatternCanon,
  ReaderPatternInstanceSlice,
} from "@/types/reader-pattern-experience";

export type PedagogicalAction = "SILENCE" | "OBSERVATION" | "REMINDER" | "INSIGHT" | "DEFER";

export type OrchestratorInteraction = "reading" | "explore_word" | "explore_sentence" | "explore_vocabulary";

export type PedagogicalReasonCode =
  | "reading_sovereign"
  | "no_pattern_detected"
  | "non_triggering_token"
  | "first_text_pass_silent"
  | "session_insight_limit"
  | "session_comprehension_limit"
  | "cognitive_short_session"
  | "familiarity_before_novelty"
  | "secondary_patterns_deferred"
  | "immersive_reading"
  | "first_exploration"
  | "second_contact_echo"
  | "insight_ready"
  | "insufficient_exposure"
  | "await_next_encounter"
  | "sentence_soft_gate";

export type PedagogicalDecisionReason = {
  code: PedagogicalReasonCode;
  message: string;
  weight: number;
};

export type OrchestratorSessionState = {
  sessionId: string;
  startedAt: number;
  insightsDelivered: number;
  comprehensionsDelivered: number;
  patternsIntroducedThisSession: string[];
  lastIntroducedPatternId: string | null;
  lastIntroducedAt: number | null;
};

export type OrchestratorPreferences = {
  immersiveReading?: boolean;
};

export type OrchestratorSentenceContext = {
  sentenceId: string;
  textId: string;
  textTitle: string;
  naturalTranslation?: string;
  wordPosition?: number | null;
  isFirstReadOfText?: boolean;
};

export type OrchestratorPatternContext = {
  patternId: string;
  pattern: ReaderPatternCanon;
  instance: ReaderPatternInstanceSlice;
};

export type OrchestratorInput = {
  interaction: OrchestratorInteraction;
  sentence: OrchestratorSentenceContext;
  primaryPattern: OrchestratorPatternContext | null;
  secondaryPatternIds: string[];
  encounter: PatternEncounterState | null;
  session: OrchestratorSessionState;
  preferences?: OrchestratorPreferences;
};

export type PedagogicalDecision = {
  action: PedagogicalAction;
  patternId: string | null;
  primaryPatternId: string | null;
  deferredPatternIds: string[];
  depthLevels: ExplanationDepth[];
  showEcho: boolean;
  suppressLegacyGrammar: boolean;
  reminder: string | null;
  softMessage: string | null;
  reasons: PedagogicalDecisionReason[];
};

export const ORCHESTRATOR_LIMITS = {
  maxInsightsPerSession: 2,
  maxComprehensionsPerSession: 1,
  maxNewPatternsPerSession: 1,
  shortSessionMs: 5 * 60 * 1000,
  echoMinExposureCount: 2,
} as const;
