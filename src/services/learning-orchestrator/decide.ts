import type {
  OrchestratorInput,
  PedagogicalDecision,
  PedagogicalDecisionReason,
} from "@/types/learning-orchestrator";

import {
  familiarityScore,
  isFirstExploration,
  isInsightReady,
  isSecondContact,
  isTokenInPatternInstance,
  shouldShowPatternEcho,
} from "./encounter-signals";
import {
  isNoveltyBlockedForPattern,
  isSessionComprehensionSaturated,
  isSessionInsightSaturated,
  isShortSession,
  actionConsumesNoveltyBudget,
} from "./session-store";
import { applyFirstSessionStrategy } from "./first-session-strategy";

function reason(
  code: PedagogicalDecisionReason["code"],
  message: string,
  weight = 1,
): PedagogicalDecisionReason {
  return { code, message, weight };
}

function silent(overrides: Partial<PedagogicalDecision> = {}): PedagogicalDecision {
  return {
    action: "SILENCE",
    patternId: null,
    primaryPatternId: null,
    deferredPatternIds: [],
    depthLevels: [],
    showEcho: false,
    suppressLegacyGrammar: false,
    reminder: null,
    softMessage: null,
    reasons: [reason("reading_sovereign", "Silence pédagogique")],
    ...overrides,
  };
}

function finalize(input: OrchestratorInput, decision: PedagogicalDecision): PedagogicalDecision {
  return applyFirstSessionStrategy(input, withDeferredSecondaries(input, decision));
}

function finalizeWithConstraints(
  input: OrchestratorInput,
  decision: PedagogicalDecision,
): PedagogicalDecision {
  return applyFirstSessionStrategy(
    input,
    withDeferredSecondaries(input, applySessionConstraints(input, decision)),
  );
}

function withDeferredSecondaries(input: OrchestratorInput, decision: PedagogicalDecision): PedagogicalDecision {
  if (input.secondaryPatternIds.length === 0) {
    return decision;
  }

  return {
    ...decision,
    deferredPatternIds: [...input.secondaryPatternIds],
    reasons: [
      ...decision.reasons,
      reason(
        "secondary_patterns_deferred",
        `${input.secondaryPatternIds.length} LP secondaire(s) repoussé(s) — une idée à la fois`,
        0.8,
      ),
    ],
  };
}

function applySessionConstraints(
  input: OrchestratorInput,
  candidate: PedagogicalDecision,
): PedagogicalDecision {
  const patternId = input.primaryPattern?.patternId ?? null;
  if (!patternId) {
    return candidate;
  }

  if (candidate.action === "INSIGHT" && isSessionInsightSaturated(input.session)) {
    return {
      ...candidate,
      action: "DEFER",
      depthLevels: [],
      reminder: null,
      softMessage: "Revenons à cette idée lors d'une prochaine lecture.",
      suppressLegacyGrammar: true,
      reasons: [
        ...candidate.reasons,
        reason(
          "session_insight_limit",
          `Session saturée : ${input.session.insightsDelivered} insight(s) déjà délivrés`,
          1,
        ),
      ],
    };
  }

  if (
    candidate.action === "INSIGHT" &&
    candidate.depthLevels.includes("L3") &&
    isSessionComprehensionSaturated(input.session)
  ) {
    return {
      ...candidate,
      action: "REMINDER",
      depthLevels: ["L1", "L2"],
      reminder: "Vous avez déjà rencontré cette idée.",
      softMessage: null,
      reasons: [
        ...candidate.reasons,
        reason(
          "session_comprehension_limit",
          "Une seule nouvelle compréhension (L3) par session",
          1,
        ),
      ],
    };
  }

  if (
    actionConsumesNoveltyBudget(candidate.action) &&
    isNoveltyBlockedForPattern(input.session, patternId)
  ) {
    return {
      ...candidate,
      action: "DEFER",
      depthLevels: [],
      reminder: null,
      softMessage: "Finissons d'abord l'idée précédente — elle reviendra.",
      suppressLegacyGrammar: true,
      reasons: [
        ...candidate.reasons,
        reason(
          "familiarity_before_novelty",
          "Familiarité avant nouveauté : un nouveau LP est repoussé",
          1,
        ),
      ],
    };
  }

  if (
    isShortSession(input.session) &&
    isFirstExploration(input.encounter) &&
    candidate.action !== "SILENCE"
  ) {
    return {
      ...candidate,
      action: "DEFER",
      depthLevels: [],
      reminder: null,
      softMessage: "Lisez encore un peu — cette idée se révélera au bon moment.",
      suppressLegacyGrammar: true,
      reasons: [
        ...candidate.reasons,
        reason("cognitive_short_session", "Session courte : éviter la surcharge cognitive", 0.9),
      ],
    };
  }

  return candidate;
}

function baseDecision(input: OrchestratorInput): PedagogicalDecision {
  const patternId = input.primaryPattern?.patternId ?? null;
  const showEcho = shouldShowPatternEcho(input.encounter);

  return {
    action: "SILENCE",
    patternId,
    primaryPatternId: patternId,
    deferredPatternIds: input.secondaryPatternIds,
    depthLevels: [],
    showEcho,
    suppressLegacyGrammar: false,
    reminder: null,
    softMessage: null,
    reasons: [],
  };
}

/**
 * Central pedagogical decision engine.
 * Implements PATTERN_EXPERIENCE.md rhythm and silence rules (without Pattern Mastery).
 */
export function decidePedagogicalIntervention(input: OrchestratorInput): PedagogicalDecision {
  if (input.interaction === "reading") {
    return finalize(
      input,
      silent({
        primaryPatternId: input.primaryPattern?.patternId ?? null,
        showEcho: shouldShowPatternEcho(input.encounter),
        reasons: [reason("reading_sovereign", "Le texte reste souverain pendant la lecture", 1)],
      }),
    );
  }

  if (input.preferences?.immersiveReading) {
    return finalize(
      input,
      silent({
        primaryPatternId: input.primaryPattern?.patternId ?? null,
        reasons: [reason("immersive_reading", "Mode lecture immersive — pas d'intervention", 1)],
      }),
    );
  }

  if (!input.primaryPattern) {
    return silent({
      reasons: [reason("no_pattern_detected", "Aucun Learning Pattern primaire", 1)],
    });
  }

  const { patternId, pattern, instance } = input.primaryPattern;
  let decision = baseDecision(input);

  if (input.interaction === "explore_vocabulary") {
    let vocabularyDecision = baseDecision(input);

    if (isInsightReady(input.encounter)) {
      vocabularyDecision = {
        ...vocabularyDecision,
        action: "INSIGHT",
        depthLevels:
          familiarityScore(input.encounter) >= 4 ? ["L1", "L2", "L3", "L4"] : ["L1", "L2", "L3"],
        suppressLegacyGrammar: true,
        reasons: [reason("insight_ready", "Vocabulary : approfondissement guidé", 1)],
      };
    } else if (isSecondContact(input.encounter)) {
      vocabularyDecision = {
        ...vocabularyDecision,
        action: "REMINDER",
        depthLevels: ["L1", "L2"],
        reminder: "Vous avez déjà croisé cette idée en lisant.",
        suppressLegacyGrammar: true,
        reasons: [reason("second_contact_echo", "Vocabulary : rappel de continuité", 1)],
      };
    } else if ((input.encounter?.exposureCount ?? 0) > 0) {
      vocabularyDecision = {
        ...vocabularyDecision,
        action: "OBSERVATION",
        depthLevels: ["L1", "L2"],
        suppressLegacyGrammar: true,
        reasons: [reason("first_exploration", "Vocabulary : observation + insight", 1)],
      };
    } else {
      vocabularyDecision = {
        ...vocabularyDecision,
        action: "OBSERVATION",
        depthLevels: ["L2"],
        suppressLegacyGrammar: true,
        reasons: [reason("first_exploration", "Vocabulary : première visite — pourquoi d'abord", 1)],
      };
    }

    return finalize(input, vocabularyDecision);
  }

  if (input.sentence.isFirstReadOfText) {
    return finalizeWithConstraints(
      input,
      {
        ...decision,
        action: "DEFER",
        patternId,
        suppressLegacyGrammar: true,
        softMessage: "Première lecture du texte — laissez l'histoire installer le contexte.",
        reasons: [reason("first_text_pass_silent", "Première passe narrative sans leçon", 1)],
      },
    );
  }

  if (input.interaction === "explore_sentence") {
    if (isInsightReady(input.encounter)) {
      decision = {
        ...decision,
        action: "INSIGHT",
        depthLevels: ["L1", "L2", "L3"],
        suppressLegacyGrammar: true,
        reasons: [
          reason("insight_ready", "Expositions et curiosité suffisantes pour l'insight", 1),
        ],
      };
    } else {
      decision = {
        ...decision,
        action: "DEFER",
        depthLevels: ["L1"],
        suppressLegacyGrammar: true,
        softMessage:
          input.sentence.naturalTranslation?.trim() ||
          "Lisez encore ; cette idée reviendra.",
        reasons: [reason("sentence_soft_gate", "Comprendre la phrase : traduction seule pour l'instant", 0.9)],
      };
    }

    return finalizeWithConstraints(input, decision);
  }

  const wordPosition = input.sentence.wordPosition;
  if (wordPosition === null || wordPosition === undefined) {
    return finalize(
      input,
      silent({
        primaryPatternId: patternId,
        reasons: [reason("non_triggering_token", "Aucun token ciblé", 1)],
      }),
    );
  }

  if (!isTokenInPatternInstance(wordPosition, instance)) {
    return finalize(
      input,
      silent({
        primaryPatternId: patternId,
        reasons: [
          reason(
            "non_triggering_token",
            "Le mot exploré n'appartient pas au LP primaire",
            1,
          ),
        ],
      }),
    );
  }

  if (isInsightReady(input.encounter)) {
    decision = {
      ...decision,
      action: "INSIGHT",
      depthLevels: ["L1", "L2", "L3"],
      suppressLegacyGrammar: true,
      reasons: [reason("insight_ready", "Prêt pour observation + insight + compréhension", 1)],
    };
  } else if (isSecondContact(input.encounter)) {
    decision = {
      ...decision,
      action: "REMINDER",
      depthLevels: ["L1"],
      reminder: "Vous avez déjà rencontré cette idée.",
      suppressLegacyGrammar: true,
      reasons: [reason("second_contact_echo", "Deuxième rencontre — continuité discrète", 1)],
    };
  } else if (isFirstExploration(input.encounter)) {
    decision = {
      ...decision,
      action: "OBSERVATION",
      depthLevels: ["L1"],
      suppressLegacyGrammar: true,
      reasons: [reason("first_exploration", "Première exploration — observation seule (L1)", 1)],
    };
  } else if (familiarityScore(input.encounter) < 2) {
    decision = {
      ...decision,
      action: "DEFER",
      suppressLegacyGrammar: true,
      softMessage: "L'idée n'est pas encore assez familière — poursuivez la lecture.",
      reasons: [reason("insufficient_exposure", "Exposition insuffisante", 0.9)],
    };
  } else {
    decision = {
      ...decision,
      action: "OBSERVATION",
      depthLevels: ["L1"],
      suppressLegacyGrammar: true,
      reasons: [reason("await_next_encounter", "Rappel observation en attendant l'insight", 0.7)],
    };
  }

  return finalizeWithConstraints(input, decision);
}
