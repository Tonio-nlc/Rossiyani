import type {
  OrchestratorInput,
  PedagogicalDecision,
} from "@/types/learning-orchestrator";

import {
  FIRST_SESSION_AHA_PATTERN_ID,
  FIRST_SESSION_AHA_TEXT_ID,
  isFirstSessionActive,
  markFirstSessionAhaDelivered,
} from "@/lib/reader/first-session";
import { isFirstSessionTextId } from "@/lib/reader/foundation-pack-path";
import { isTokenInPatternInstance } from "./encounter-signals";

/**
 * First Session strategy for Foundation Pack texts 1–3.
 * Guarantees one memorable Aha on family (role terminations) without showing engine chrome.
 */
export function applyFirstSessionStrategy(
  input: OrchestratorInput,
  candidate: PedagogicalDecision,
): PedagogicalDecision {
  if (!isFirstSessionActive() || !isFirstSessionTextId(input.sentence.textId)) {
    return candidate;
  }

  if (input.interaction === "reading") {
    return candidate;
  }

  const patternId = input.primaryPattern?.patternId ?? null;

  // Intro: stay silent on word explore — let the story install.
  if (input.sentence.textId === "text-a1-intro-01") {
    return {
      ...candidate,
      action: "SILENCE",
      depthLevels: [],
      reminder: null,
      softMessage: null,
      showEcho: false,
      suppressLegacyGrammar: true,
    };
  }

  // Family: deliver Aha on first click on a pattern token (сестры, семью…).
  if (
    input.sentence.textId === FIRST_SESSION_AHA_TEXT_ID &&
    patternId === FIRST_SESSION_AHA_PATTERN_ID &&
    input.interaction === "explore_word" &&
    input.sentence.wordPosition !== null &&
    input.sentence.wordPosition !== undefined &&
    input.primaryPattern?.instance &&
    isTokenInPatternInstance(input.sentence.wordPosition, input.primaryPattern.instance)
  ) {
    markFirstSessionAhaDelivered();
    return {
      ...candidate,
      action: "INSIGHT",
      patternId,
      depthLevels: ["L2"],
      reminder: null,
      softMessage: null,
      suppressLegacyGrammar: true,
    };
  }

  // Home: possession insight on у / меня in possession span.
  if (
    input.sentence.textId === "text-a1-home-01" &&
    patternId === "lp.syntax.possession_existence.v1" &&
    input.interaction === "explore_word" &&
    input.primaryPattern?.instance &&
    input.sentence.wordPosition !== null &&
    input.sentence.wordPosition !== undefined &&
    isTokenInPatternInstance(input.sentence.wordPosition, input.primaryPattern.instance)
  ) {
    return {
      ...candidate,
      action: "INSIGHT",
      patternId,
      depthLevels: ["L2"],
      reminder: null,
      softMessage: null,
      suppressLegacyGrammar: true,
    };
  }

  // Default first-session: silence instead of DEFER cards.
  if (candidate.action === "DEFER" || candidate.action === "REMINDER") {
    return {
      ...candidate,
      action: "SILENCE",
      depthLevels: [],
      reminder: null,
      softMessage: null,
    };
  }

  return candidate;
}
