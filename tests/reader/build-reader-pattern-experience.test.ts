import { describe, expect, it, beforeEach } from "vitest";

import { resetPatternEncounters } from "@/lib/reader/pattern-encounter-store";
import { resetOrchestratorSession } from "@/services/learning-orchestrator/session-store";
import {
  buildReaderPatternExperience,
  buildReaderPatternSentenceInsight,
  shouldShowPatternEcho,
} from "@/services/reader/build-reader-pattern-experience";
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

describe("buildReaderPatternExperience", () => {
  beforeEach(() => {
    resetPatternEncounters();
    resetOrchestratorSession();
  });

  it("stays silent during reading", () => {
    const view = buildReaderPatternExperience({
      pattern: possessionPattern,
      instance,
      secondaryPatternCount: 1,
      wordPosition: 1,
      interaction: "reading",
      encounter: encounter(),
    });

    expect(view.visible).toBe(false);
    expect(view.phase).toBe("silent");
  });

  it("shows L1 only on first explore of a triggering token", () => {
    const view = buildReaderPatternExperience({
      pattern: possessionPattern,
      instance,
      secondaryPatternCount: 0,
      wordPosition: 1,
      interaction: "explore_word",
      encounter: encounter({ exploreCount: 0 }),
      session: {
        sessionId: "test",
        startedAt: Date.now() - 10 * 60 * 1000,
        insightsDelivered: 0,
        comprehensionsDelivered: 0,
        patternsIntroducedThisSession: [],
        lastIntroducedPatternId: null,
        lastIntroducedAt: null,
      },
    });

    expect(view.visible).toBe(true);
    expect(view.phase).toBe("first_explore");
    expect(view.sections).toHaveLength(1);
    expect(view.sections[0]?.depth).toBe("L1");
    expect(view.sections[0]?.content).toContain("у");
    expect(view.suppressLegacyGrammar).toBe(true);
  });

  it("shows a discreet reminder on second contact", () => {
    const view = buildReaderPatternExperience({
      pattern: possessionPattern,
      instance,
      secondaryPatternCount: 0,
      wordPosition: 2,
      interaction: "explore_word",
      encounter: encounter({ exposureCount: 2, exploreCount: 1 }),
      session: {
        sessionId: "test",
        startedAt: Date.now() - 10 * 60 * 1000,
        insightsDelivered: 0,
        comprehensionsDelivered: 0,
        patternsIntroducedThisSession: [possessionPattern.id],
        lastIntroducedPatternId: possessionPattern.id,
        lastIntroducedAt: Date.now() - 60_000,
      },
    });

    expect(view.phase).toBe("second_contact");
    expect(view.reminder).toBe("Vous avez déjà rencontré cette idée.");
    expect(view.sections).toHaveLength(1);
    expect(view.sections[0]?.depth).toBe("L1");
  });

  it("shows observation, insight and comprehension when insight-ready", () => {
    const view = buildReaderPatternExperience({
      pattern: possessionPattern,
      instance,
      secondaryPatternIds: ["lp.a.v1", "lp.b.v1"],
      wordPosition: 0,
      interaction: "explore_word",
      encounter: encounter({ exposureCount: 3, exploreCount: 2 }),
      session: {
        sessionId: "test",
        startedAt: Date.now() - 10 * 60 * 1000,
        insightsDelivered: 0,
        comprehensionsDelivered: 0,
        patternsIntroducedThisSession: [possessionPattern.id],
        lastIntroducedPatternId: possessionPattern.id,
        lastIntroducedAt: Date.now() - 120_000,
      },
    });

    expect(view.phase).toBe("insight");
    expect(view.sections.map((section) => section.depth)).toEqual(["L1", "L2", "L3"]);
    expect(view.secondaryPatternCount).toBe(2);
  });

  it("hides the card when there is no pattern", () => {
    const view = buildReaderPatternExperience({
      pattern: null,
      instance: null,
      secondaryPatternCount: 0,
      wordPosition: 0,
      interaction: "explore_word",
      encounter: null,
    });

    expect(view.visible).toBe(false);
  });

  it("hides the card when exploring a non-triggering token", () => {
    const view = buildReaderPatternExperience({
      pattern: possessionPattern,
      instance,
      secondaryPatternCount: 0,
      wordPosition: 9,
      interaction: "explore_word",
      encounter: encounter(),
    });

    expect(view.visible).toBe(false);
  });

  it("soft-gates sentence insight before insight-ready", () => {
    const gate = buildReaderPatternSentenceInsight({
      naturalTranslation: "Ma sœur a un chat.",
      patternContext: { primaryPatternId: possessionPattern.id },
      pattern: possessionPattern,
      instance,
      encounter: encounter({ exposureCount: 1 }),
      session: {
        sessionId: "test",
        startedAt: Date.now() - 10 * 60 * 1000,
        insightsDelivered: 0,
        comprehensionsDelivered: 0,
        patternsIntroducedThisSession: [],
        lastIntroducedPatternId: null,
        lastIntroducedAt: null,
      },
    });

    expect(gate.softGate).toBe(true);
    expect(gate.body).toContain("Ma sœur");
  });

  it("allows full sentence insight when insight-ready", () => {
    const gate = buildReaderPatternSentenceInsight({
      naturalTranslation: "Ma sœur a un chat.",
      patternContext: { primaryPatternId: possessionPattern.id },
      pattern: possessionPattern,
      instance,
      encounter: encounter({ exposureCount: 3, exploreCount: 1 }),
      session: {
        sessionId: "test",
        startedAt: Date.now() - 10 * 60 * 1000,
        insightsDelivered: 0,
        comprehensionsDelivered: 0,
        patternsIntroducedThisSession: [possessionPattern.id],
        lastIntroducedPatternId: possessionPattern.id,
        lastIntroducedAt: Date.now() - 120_000,
      },
    });

    expect(gate.softGate).toBe(false);
  });

  it("enables pattern echo from the second exposure onward", () => {
    expect(shouldShowPatternEcho(encounter({ exposureCount: 1 }))).toBe(false);
    expect(shouldShowPatternEcho(encounter({ exposureCount: 2 }))).toBe(true);
  });
});
