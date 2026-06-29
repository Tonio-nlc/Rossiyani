import type { PedagogicalDecision } from "@/types/learning-orchestrator";
import type {
  ReaderPatternCanon,
  ReaderPatternExperienceView,
  ReaderPatternCardSection,
} from "@/types/reader-pattern-experience";

const PATTERN_HEADLINE: Record<string, string> = {
  "lp.verbs.present_conjugation.v1": "Pourquoi la fin du verbe change ?",
  "lp.morphology.role_terminations.v1": "Pourquoi la même idée change de forme ?",
  "lp.syntax.possession_existence.v1": "Pourquoi « avoir » ne se dit pas comme en français ?",
  "lp.foundation.stress_marks.v1": "Que faut-il remarquer dans ce mot ?",
};

function section(content: string): ReaderPatternCardSection {
  return {
    depth: "L2",
    label: "",
    content: content.trim(),
  };
}

function hidden(decision: PedagogicalDecision): ReaderPatternExperienceView {
  return {
    visible: false,
    phase: "silent",
    patternId: decision.patternId,
    title: null,
    reminder: null,
    sections: [],
    anchorText: null,
    suppressLegacyGrammar: decision.suppressLegacyGrammar,
    secondaryPatternCount: decision.deferredPatternIds.length,
  };
}

function phaseFromAction(
  action: PedagogicalDecision["action"],
): ReaderPatternExperienceView["phase"] {
  switch (action) {
    case "OBSERVATION":
      return "first_explore";
    case "REMINDER":
      return "second_contact";
    case "INSIGHT":
      return "insight";
    default:
      return "silent";
  }
}

function resolveHeadline(pattern: ReaderPatternCanon, anchorText: string | null): string {
  if (anchorText && pattern.id === "lp.morphology.role_terminations.v1") {
    return `Pourquoi « ${anchorText} » s'écrit ainsi ?`;
  }
  if (anchorText && pattern.id === "lp.syntax.possession_existence.v1") {
    return "Pourquoi cette phrase ne dit pas « j'ai » ?";
  }
  return PATTERN_HEADLINE[pattern.id] ?? "Pourquoi cette phrase est-elle écrite comme ça ?";
}

/**
 * Maps an orchestrator decision to the Reader vertical-slice view model.
 * User-facing copy only — no engine vocabulary (Observation, Insight, LP…).
 */
export function mapDecisionToReaderExperience(
  decision: PedagogicalDecision,
  pattern: ReaderPatternCanon | null,
  anchorText?: string | null,
): ReaderPatternExperienceView {
  if (decision.action === "SILENCE" || !pattern || !decision.patternId) {
    return hidden(decision);
  }

  const sections: ReaderPatternCardSection[] = [];
  const headline = resolveHeadline(pattern, anchorText ?? null);

  if (decision.action === "INSIGHT") {
    sections.push(section(pattern.insight));
    if (decision.depthLevels.includes("L3")) {
      sections.push(section(pattern.comprehension));
    }
  } else if (decision.action === "OBSERVATION" || decision.action === "REMINDER") {
    sections.push(section(pattern.observation));
    if (decision.reminder) {
      sections.push(section(decision.reminder));
    }
  } else if (decision.action === "DEFER" && decision.softMessage) {
    // First session maps DEFER → SILENCE; fallback copy if ever shown.
    sections.push(section(decision.softMessage));
  }

  const visible =
    decision.action === "OBSERVATION" ||
    decision.action === "REMINDER" ||
    decision.action === "INSIGHT";

  return {
    visible,
    phase: phaseFromAction(decision.action),
    patternId: decision.patternId,
    title: headline,
    reminder: null,
    sections,
    anchorText: decision.action === "INSIGHT" ? anchorText ?? null : null,
    suppressLegacyGrammar: decision.suppressLegacyGrammar,
    secondaryPatternCount: 0,
  };
}

export function mapDecisionToSentenceInsightGate(
  decision: PedagogicalDecision,
  naturalTranslation: string,
  hasPrimaryPattern: boolean,
): { available: boolean; softGate: boolean; body: string } {
  if (!hasPrimaryPattern) {
    return { available: true, softGate: false, body: "" };
  }

  if (decision.action === "INSIGHT") {
    return { available: true, softGate: false, body: "" };
  }

  if (decision.action === "DEFER" || decision.action === "SILENCE" || decision.action === "OBSERVATION") {
    return {
      available: true,
      softGate: decision.action !== "SILENCE",
      body:
        decision.softMessage?.trim() ||
        naturalTranslation.trim() ||
        "Lisez encore — une idée se précisera bientôt.",
    };
  }

  return { available: true, softGate: false, body: "" };
}

export function mapDecisionToPatternEcho(decision: PedagogicalDecision): boolean {
  return decision.showEcho;
}
