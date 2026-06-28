import { describe, expect, it, beforeEach } from "vitest";

import { resetPatternEncounters } from "@/lib/reader/pattern-encounter-store";
import { decidePedagogicalIntervention } from "@/services/learning-orchestrator";
import { resetOrchestratorSession } from "@/services/learning-orchestrator/session-store";
import type {
  OrchestratorSessionState,
  PedagogicalDecision,
} from "@/types/learning-orchestrator";
import type {
  PatternEncounterState,
  ReaderPatternCanon,
  ReaderPatternInstanceSlice,
} from "@/types/reader-pattern-experience";

const possessionPattern: ReaderPatternCanon = {
  id: "lp.syntax.possession_existence.v1",
  userFacingName: "Avoir, c'est « il y a près de moi »",
  observation: "Pour dire ce qu'on possède, le russe utilise souvent « у » et une forme modifiée du nom.",
  insight: "Imaginez « chez moi, il y a… » plutôt que « je possède… ».",
  comprehension: "У меня есть брат = littéralement « près de moi, il y a un frère ».",
};

const rolePattern: ReaderPatternCanon = {
  id: "lp.morphology.role_terminations.v1",
  userFacingName: "Les mots changent selon leur rôle",
  observation: "Les terminaisons changent selon le rôle du nom.",
  insight: "Comme des étiquettes de fonction.",
  comprehension: "Le russe marque les rôles à la surface.",
};

const instance: ReaderPatternInstanceSlice = {
  span: { startPosition: 0, endPosition: 2 },
  triggeringTokens: [0, 1, 2],
  salience: 0.9,
  confidence: 0.85,
};

function encounter(overrides: Partial<PatternEncounterState> = {}): PatternEncounterState {
  return {
    exposureCount: 0,
    exploreCount: 0,
    lastTextId: null,
    lastTextTitle: null,
    lastSentenceId: null,
    ...overrides,
  };
}

function freshSession(overrides: Partial<OrchestratorSessionState> = {}): OrchestratorSessionState {
  return {
    sessionId: "test-session",
    startedAt: Date.now() - 10 * 60 * 1000,
    insightsDelivered: 0,
    comprehensionsDelivered: 0,
    patternsIntroducedThisSession: [],
    lastIntroducedPatternId: null,
    lastIntroducedAt: null,
    ...overrides,
  };
}

function decide(overrides: {
  interaction?: "reading" | "explore_word" | "explore_sentence";
  pattern?: ReaderPatternCanon;
  secondaryPatternIds?: string[];
  encounter?: PatternEncounterState | null;
  session?: OrchestratorSessionState;
  wordPosition?: number | null;
  isFirstReadOfText?: boolean;
  immersiveReading?: boolean;
}): PedagogicalDecision {
  const pattern = overrides.pattern ?? possessionPattern;
  return decidePedagogicalIntervention({
    interaction: overrides.interaction ?? "explore_word",
    sentence: {
      sentenceId: "sentence-1",
      textId: "text-1",
      textTitle: "Test",
      wordPosition: overrides.wordPosition ?? 1,
      isFirstReadOfText: overrides.isFirstReadOfText ?? false,
    },
    primaryPattern: {
      patternId: pattern.id,
      pattern,
      instance,
    },
    secondaryPatternIds: overrides.secondaryPatternIds ?? [],
    encounter: overrides.encounter ?? encounter(),
    session: overrides.session ?? freshSession(),
    preferences: overrides.immersiveReading ? { immersiveReading: true } : undefined,
  });
}

describe("Learning Orchestrator", () => {
  beforeEach(() => {
    resetPatternEncounters();
    resetOrchestratorSession();
  });

  it("stays silent during reading", () => {
    const decision = decide({ interaction: "reading" });
    expect(decision.action).toBe("SILENCE");
    expect(decision.reasons.some((reason) => reason.code === "reading_sovereign")).toBe(true);
  });

  it("defers secondary patterns in the same sentence", () => {
    const decision = decide({
      secondaryPatternIds: ["lp.morphology.role_terminations.v1"],
      encounter: encounter({ exploreCount: 0 }),
    });

    expect(decision.deferredPatternIds).toContain("lp.morphology.role_terminations.v1");
    expect(decision.reasons.some((reason) => reason.code === "secondary_patterns_deferred")).toBe(
      true,
    );
  });

  it("shows observation on first exploration", () => {
    const decision = decide({ encounter: encounter({ exploreCount: 0 }) });
    expect(decision.action).toBe("OBSERVATION");
    expect(decision.depthLevels).toEqual(["L1"]);
  });

  it("shows reminder on second contact", () => {
    const decision = decide({
      encounter: encounter({ exposureCount: 2, exploreCount: 1 }),
    });
    expect(decision.action).toBe("REMINDER");
    expect(decision.reminder).toContain("déjà rencontré");
  });

  it("triggers insight when ready", () => {
    const decision = decide({
      encounter: encounter({ exposureCount: 3, exploreCount: 2 }),
    });
    expect(decision.action).toBe("INSIGHT");
    expect(decision.depthLevels).toEqual(["L1", "L2", "L3"]);
  });

  it("defers a second new pattern when one was just introduced in session", () => {
    const decision = decide({
      pattern: rolePattern,
      session: freshSession({
        patternsIntroducedThisSession: [possessionPattern.id],
        lastIntroducedPatternId: possessionPattern.id,
        lastIntroducedAt: Date.now() - 30_000,
      }),
      encounter: encounter({ exploreCount: 0 }),
    });

    expect(decision.action).toBe("DEFER");
    expect(decision.reasons.some((reason) => reason.code === "familiarity_before_novelty")).toBe(
      true,
    );
  });

  it("defers insight when session insight budget is exhausted", () => {
    const decision = decide({
      encounter: encounter({ exposureCount: 4, exploreCount: 2 }),
      session: freshSession({ insightsDelivered: 2 }),
    });

    expect(decision.action).toBe("DEFER");
    expect(decision.reasons.some((reason) => reason.code === "session_insight_limit")).toBe(true);
  });

  it("defers on first read of a text", () => {
    const decision = decide({
      isFirstReadOfText: true,
      encounter: encounter({ exploreCount: 0 }),
    });

    expect(decision.action).toBe("DEFER");
    expect(decision.reasons.some((reason) => reason.code === "first_text_pass_silent")).toBe(true);
  });

  it("stays silent in immersive reading mode", () => {
    const decision = decide({
      immersiveReading: true,
      encounter: encounter({ exploreCount: 0 }),
    });

    expect(decision.action).toBe("SILENCE");
    expect(decision.reasons.some((reason) => reason.code === "immersive_reading")).toBe(true);
  });

  it("defers during a very short session on first exploration", () => {
    const decision = decide({
      session: freshSession({ startedAt: Date.now() - 60_000 }),
      encounter: encounter({ exploreCount: 0 }),
    });

    expect(decision.action).toBe("DEFER");
    expect(decision.reasons.some((reason) => reason.code === "cognitive_short_session")).toBe(
      true,
    );
  });
});
