import type { PedagogicalDecision } from "@/types/learning-orchestrator";
import type {
  ReaderPatternCanon,
  ReaderPatternExperienceView,
  ReaderPatternCardSection,
} from "@/types/reader-pattern-experience";

const DEPTH_LABELS: Record<ReaderPatternCardSection["depth"], string> = {
  L1: "Observation",
  L2: "Insight",
  L3: "Compréhension",
  L4: "Formalisation",
  L5: "Nuances",
};

function section(depth: ReaderPatternCardSection["depth"], content: string): ReaderPatternCardSection {
  return {
    depth,
    label: DEPTH_LABELS[depth],
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
    case "DEFER":
      return "first_explore";
    default:
      return "silent";
  }
}

/**
 * Maps an orchestrator decision to the Reader vertical-slice view model.
 */
export function mapDecisionToReaderExperience(
  decision: PedagogicalDecision,
  pattern: ReaderPatternCanon | null,
  anchorText?: string | null,
): ReaderPatternExperienceView {
  if (
    decision.action === "SILENCE" ||
    !pattern ||
    !decision.patternId
  ) {
    return hidden(decision);
  }

  const sections: ReaderPatternCardSection[] = [];

  if (decision.action === "DEFER") {
    sections.push({
      depth: "L1",
      label: "Pour l'instant",
      content:
        decision.softMessage?.trim() ||
        "Lisez encore ; cette idée reviendra.",
    });
  } else {
    for (const depth of decision.depthLevels) {
      if (depth === "L1") {
        sections.push(section("L1", pattern.observation));
      }
      if (depth === "L2") {
        sections.push(section("L2", pattern.insight));
      }
      if (depth === "L3") {
        sections.push(section("L3", pattern.comprehension));
      }
    }
  }

  const visible =
    decision.action === "OBSERVATION" ||
    decision.action === "REMINDER" ||
    decision.action === "INSIGHT" ||
    (decision.action === "DEFER" && Boolean(decision.softMessage));

  return {
    visible,
    phase: phaseFromAction(decision.action),
    patternId: decision.patternId,
    title: pattern.userFacingName,
    reminder: decision.reminder,
    sections,
    anchorText: decision.action === "INSIGHT" ? anchorText ?? null : null,
    suppressLegacyGrammar: decision.suppressLegacyGrammar,
    secondaryPatternCount: decision.deferredPatternIds.length,
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
      softGate: true,
      body:
        decision.softMessage?.trim() ||
        naturalTranslation.trim() ||
        "Lisez encore ; cette idée reviendra.",
    };
  }

  return { available: true, softGate: false, body: "" };
}

export function mapDecisionToPatternEcho(decision: PedagogicalDecision): boolean {
  return decision.showEcho;
}
