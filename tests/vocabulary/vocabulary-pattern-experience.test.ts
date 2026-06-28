import { describe, expect, it } from "vitest";

import {
  decidePedagogicalIntervention,
  mapDecisionToVocabularyExperience,
} from "@/services/learning-orchestrator";
import type { PatternEncounterState } from "@/types/reader-pattern-experience";

const pattern = {
  id: "lp.syntax.possession_existence.v1",
  userFacingName: "Avoir, c'est « il y a près de moi »",
  observation: "Le russe utilise souvent у + génitif.",
  insight: "Imaginez « chez moi, il y a… »",
  comprehension: "У меня есть брат = près de moi, il y a un frère.",
};

function vocabularyInput(encounter: PatternEncounterState | null) {
  return {
    interaction: "explore_vocabulary" as const,
    sentence: {
      sentenceId: "s1",
      textId: "t1",
      textTitle: "Test",
    },
    primaryPattern: {
      patternId: pattern.id,
      pattern,
      instance: {
        span: { startPosition: 0, endPosition: 2 },
        triggeringTokens: [1],
        salience: 1,
        confidence: 1,
      },
    },
    secondaryPatternIds: [],
    encounter,
    session: {
      sessionId: "test",
      startedAt: Date.now(),
      insightsDelivered: 0,
      comprehensionsDelivered: 0,
      patternsIntroducedThisSession: [],
      lastIntroducedPatternId: null,
      lastIntroducedAt: null,
    },
  };
}

describe("explore_vocabulary orchestrator", () => {
  it("shows L2 only on first vocabulary visit", () => {
    const decision = decidePedagogicalIntervention(vocabularyInput(null));
    const view = mapDecisionToVocabularyExperience(decision, pattern, "Formalisation");

    expect(decision.depthLevels).toEqual(["L2"]);
    expect(view.visible).toBe(true);
    expect(view.sections).toHaveLength(1);
    expect(view.sections[0]?.depth).toBe("L2");
  });

  it("deepens to L1–L3 when insight-ready", () => {
    const decision = decidePedagogicalIntervention(
      vocabularyInput({ exposureCount: 4, exploreCount: 2, lastTextId: "t1", lastTextTitle: "T", lastSentenceId: "s1" }),
    );
    const view = mapDecisionToVocabularyExperience(decision, pattern, "Formalisation");

    expect(decision.action).toBe("INSIGHT");
    expect(view.sections.map((section) => section.depth)).toContain("L3");
    expect(view.sections.some((section) => section.depth === "L4")).toBe(true);
  });
});
