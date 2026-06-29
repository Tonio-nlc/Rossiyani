import type { PedagogicalDecision } from "@/types/learning-orchestrator";
import type { ReaderPedagogicalDepth } from "@/types/reader-pedagogical-depth";
import type {
  ReaderPatternCanon,
  ReaderPatternExperienceView,
  ReaderPatternCardSection,
} from "@/types/reader-pattern-experience";

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

/**
 * Maps an orchestrator decision to progressive Reader depth.
 * Depth only — no copy, no visibility flag.
 */
export function mapDecisionToReaderDepth(
  decision: PedagogicalDecision,
  options: { isPatternBearer: boolean },
): ReaderPedagogicalDepth {
  if (!options.isPatternBearer || !decision.patternId) {
    return "none";
  }

  switch (decision.action) {
    case "INSIGHT":
      return decision.depthLevels.includes("L3") ? "understand" : "insight";
    case "OBSERVATION":
      return "observe";
    case "REMINDER":
      return "reminder";
    case "DEFER":
    case "SILENCE":
      return "notice";
    default:
      return "notice";
  }
}

/**
 * Maps an orchestrator decision to the vocabulary fiche view model.
 * @deprecated Reader word panel uses {@link mapDecisionToReaderDepth} instead.
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
  const headline = pattern.guide.headlineWithAnchor.replace(
    /\{\{anchor\}\}/g,
    anchorText?.trim() ?? "",
  );

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
    title: anchorText?.trim() ? headline : pattern.guide.headlineDefault,
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
