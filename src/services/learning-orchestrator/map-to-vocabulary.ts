import type { PedagogicalDecision } from "@/types/learning-orchestrator";
import type {
  ReaderPatternCanon,
  ReaderPatternCardSection,
  ReaderPatternExperienceView,
} from "@/types/reader-pattern-experience";

const DEPTH_LABELS: Record<ReaderPatternCardSection["depth"], string> = {
  L1: "Ce qu'il faut remarquer",
  L2: "Pourquoi c'est important",
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
    suppressLegacyGrammar: true,
    secondaryPatternCount: decision.deferredPatternIds.length,
  };
}

/**
 * Vocabulary deepens patterns already encountered — always pattern-first when visible.
 */
export function mapDecisionToVocabularyExperience(
  decision: PedagogicalDecision,
  pattern: ReaderPatternCanon | null,
  formalization?: string | null,
): ReaderPatternExperienceView {
  if (!pattern || !decision.patternId) {
    return hidden(decision);
  }

  const sections: ReaderPatternCardSection[] = [];

  for (const depth of decision.depthLevels) {
    if (depth === "L1" && pattern.observation) {
      sections.push(section("L1", pattern.observation));
    }
    if (depth === "L2" && pattern.insight) {
      sections.push(section("L2", pattern.insight));
    }
    if (depth === "L3" && pattern.comprehension) {
      sections.push(section("L3", pattern.comprehension));
    }
    if (depth === "L4" && formalization?.trim()) {
      sections.push(section("L4", formalization));
    }
  }

  const visible = sections.length > 0 || decision.action === "REMINDER";

  return {
    visible,
    phase: decision.action === "INSIGHT" ? "insight" : "first_explore",
    patternId: decision.patternId,
    title: pattern.userFacingName,
    reminder: decision.reminder,
    sections,
    anchorText: null,
    suppressLegacyGrammar: true,
    secondaryPatternCount: decision.deferredPatternIds.length,
  };
}
