import { describe, expect, it, beforeEach } from "vitest";

import { decidePedagogicalIntervention } from "@/services/learning-orchestrator";
import { resetOrchestratorSession } from "@/services/learning-orchestrator/session-store";
import type { OrchestratorSessionState } from "@/types/learning-orchestrator";
import type { ReaderPatternInstanceSlice } from "@/types/reader-pattern-experience";
import { patternCanonFixture } from "../fixtures/pattern-canon";

const rolePattern = patternCanonFixture({
  id: "lp.morphology.role_terminations.v1",
  userFacingName: "Les mots changent selon leur rôle",
  observation: "Les terminaisons changent selon le rôle du nom.",
  insight: "Ces terminaisons signalent le rôle du mot — comme des étiquettes.",
  comprehension: "« сестра » et « сестры » ne sont pas interchangeables.",
});

const instance: ReaderPatternInstanceSlice = {
  span: { startPosition: 1, endPosition: 3 },
  triggeringTokens: [2],
  salience: 0.9,
  confidence: 0.85,
};

function freshSession(): OrchestratorSessionState {
  return {
    sessionId: "test-session",
    startedAt: Date.now() - 10 * 60 * 1000,
    insightsDelivered: 0,
    comprehensionsDelivered: 0,
    patternsIntroducedThisSession: [],
    lastIntroducedPatternId: null,
    lastIntroducedAt: null,
  };
}

describe("First Session — family Aha", () => {
  beforeEach(() => {
    resetOrchestratorSession();
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("rossiyani:firstSession");
    }
  });

  it("delivers INSIGHT on first word click in family text", () => {
    const decision = decidePedagogicalIntervention({
      interaction: "explore_word",
      sentence: {
        sentenceId: "sentence-family-2",
        textId: "text-a1-family-01",
        textTitle: "Моя семья",
        wordPosition: 2,
        isFirstReadOfText: true,
      },
      primaryPattern: {
        patternId: rolePattern.id,
        pattern: rolePattern,
        instance,
      },
      secondaryPatternIds: [],
      encounter: null,
      session: freshSession(),
    });

    expect(decision.action).toBe("INSIGHT");
    expect(decision.depthLevels).toEqual(["L2"]);
  });

  it("stays silent on intro word explore during first session", () => {
    const decision = decidePedagogicalIntervention({
      interaction: "explore_word",
      sentence: {
        sentenceId: "sentence-intro-1",
        textId: "text-a1-intro-01",
        textTitle: "Привет!",
        wordPosition: 1,
        isFirstReadOfText: true,
      },
      primaryPattern: {
        patternId: "lp.verbs.present_conjugation.v1",
        pattern: {
          id: "lp.verbs.present_conjugation.v1",
          userFacingName: "Les verbes changent",
          observation: "obs",
          insight: "ins",
          comprehension: "comp",
        },
        instance,
      },
      secondaryPatternIds: [],
      encounter: null,
      session: freshSession(),
    });

    expect(decision.action).toBe("SILENCE");
  });
});
