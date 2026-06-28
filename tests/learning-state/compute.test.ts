import { describe, expect, it } from "vitest";

import {
  applyLearningEvent,
  computeLearningState,
  emptyLearningStateRecord,
  recordToInput,
  toOrchestratorEncounterSignals,
} from "@/services/learning-state";

const USER = "user-test";
const PATTERN = "lp.syntax.possession_existence.v1";

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

describe("computeLearningState dimensions", () => {
  it("keeps exposure and observation independent — heavy reader, never explored", () => {
    let record = emptyLearningStateRecord(USER, PATTERN);

    for (let index = 0; index < 12; index += 1) {
      record = applyLearningEvent(record, {
        type: "exposure",
        textId: index % 3 === 0 ? "text-a" : index % 3 === 1 ? "text-b" : "text-c",
        sentenceId: `s-${index}`,
        at: daysAgo(2),
      });
    }

    const state = computeLearningState(recordToInput(record));

    expect(state.dimensions.exposure).toBeGreaterThan(0.7);
    expect(state.dimensions.observation).toBeLessThan(0.15);
    expect(state.dimensions.comprehension).toBeLessThan(0.2);
    expect(state.lifecycle).toBe("observed");
  });

  it("models forgetting — understood once, long absence", () => {
    let record = emptyLearningStateRecord(USER, PATTERN);

    for (let index = 0; index < 5; index += 1) {
      record = applyLearningEvent(record, {
        type: "exposure",
        textId: "text-a",
        sentenceId: `s-${index}`,
        at: daysAgo(60),
      });
    }

    record = applyLearningEvent(record, {
      type: "explain",
      depth: "L3",
      at: daysAgo(58),
    });

    const state = computeLearningState(
      recordToInput(record, { asOf: new Date() }),
    );

    expect(state.dimensions.comprehension).toBeGreaterThan(0.65);
    expect(state.dimensions.stability).toBeLessThan(0.25);
    expect(state.lifecycle).toBe("understood");
  });

  it("models compose-strong / exposure-weak profile", () => {
    let record = emptyLearningStateRecord(USER, PATTERN);

    record = applyLearningEvent(record, {
      type: "exposure",
      textId: "text-a",
      sentenceId: "s-1",
      at: daysAgo(1),
    });

    for (let index = 0; index < 6; index += 1) {
      record = applyLearningEvent(record, {
        type: "produce",
        success: index < 5,
        at: daysAgo(1),
      });
    }

    const state = computeLearningState(recordToInput(record));

    expect(state.dimensions.exposure).toBeLessThan(0.35);
    expect(state.dimensions.reuse).toBeGreaterThan(state.dimensions.exposure);
    expect(state.dimensions.confidence).toBeLessThan(state.dimensions.reuse);
    expect(state.lifecycle).toBe("latent");
  });

  it("models beginner — latent lifecycle, no depth", () => {
    const state = computeLearningState(recordToInput(emptyLearningStateRecord(USER, PATTERN)));

    expect(state.lifecycle).toBe("latent");
    expect(state.maxDepthAllowed).toBeNull();
    expect(state.dimensions.exposure).toBe(0);
    expect(state.dimensions.observation).toBe(0);
  });

  it("progresses through events toward connected state", () => {
    let record = emptyLearningStateRecord(USER, PATTERN);

    record = applyLearningEvent(record, {
      type: "exposure",
      textId: "text-a",
      sentenceId: "s-1",
    });
    record = applyLearningEvent(record, {
      type: "exposure",
      textId: "text-b",
      sentenceId: "s-2",
    });
    record = applyLearningEvent(record, {
      type: "explore",
      surface: "reader",
      depth: "L2",
    });
    record = applyLearningEvent(record, {
      type: "explain",
      depth: "L3",
    });
    record = applyLearningEvent(record, {
      type: "connect",
      relatedPatternId: "lp.morphology.role_terminations.v1",
    });

    const state = computeLearningState(recordToInput(record));

    expect(state.dimensions.comprehension).toBeGreaterThan(0.65);
    expect(state.lifecycle).toBe("connected");
    expect(state.maxDepthAllowed).toBe("L3");
  });
});

describe("orchestrator bridge", () => {
  it("exports encounter-compatible signals from learning state", () => {
    let record = emptyLearningStateRecord(USER, PATTERN);

    for (let index = 0; index < 4; index += 1) {
      record = applyLearningEvent(record, {
        type: "exposure",
        textId: "text-a",
        sentenceId: `s-${index}`,
      });
    }
    record = applyLearningEvent(record, { type: "explore", surface: "reader" });
    record = applyLearningEvent(record, { type: "explore", surface: "vocabulary", depth: "L2" });

    const state = computeLearningState(recordToInput(record));
    const signals = toOrchestratorEncounterSignals(state);

    expect(signals.exposureCount).toBe(4);
    expect(signals.exploreCount).toBe(2);
    expect(signals.isInsightReady).toBe(true);
  });
});
