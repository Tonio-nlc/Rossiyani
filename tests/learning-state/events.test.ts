import { describe, expect, it } from "vitest";

import {
  applyLearningEvent,
  computeDimensions,
  deriveLifecycle,
  recordToInput,
} from "@/services/learning-state";
import { emptyLearningStateRecord } from "@/types/learning-state";

describe("applyLearningEvent", () => {
  it("deduplicates distinct texts and explanation depths", () => {
    let record = emptyLearningStateRecord("u1", "lp.test.v1");

    record = applyLearningEvent(record, {
      type: "exposure",
      textId: "t1",
      sentenceId: "s1",
    });
    record = applyLearningEvent(record, {
      type: "exposure",
      textId: "t1",
      sentenceId: "s2",
    });
    record = applyLearningEvent(record, { type: "explain", depth: "L2" });
    record = applyLearningEvent(record, { type: "explain", depth: "L2" });

    expect(record.exposureCount).toBe(2);
    expect(record.distinctTextIds).toEqual(["t1"]);
    expect(record.explanationDepthsSeen).toEqual(["L2"]);
  });

  it("tracks retrieval and production separately", () => {
    let record = emptyLearningStateRecord("u1", "lp.test.v1");

    record = applyLearningEvent(record, { type: "retrieve", success: true });
    record = applyLearningEvent(record, { type: "retrieve", success: false });
    record = applyLearningEvent(record, { type: "produce", success: true });

    const dimensions = computeDimensions(recordToInput(record));

    expect(record.retrievalAttempts).toBe(2);
    expect(record.retrievalSuccesses).toBe(1);
    expect(record.productionAttempts).toBe(1);
    expect(dimensions.confidence).toBeGreaterThan(0);
    expect(dimensions.reuse).toBeGreaterThan(0);
  });
});

describe("deriveLifecycle", () => {
  it("never maps to mastered without stability and reuse", () => {
    const lifecycle = deriveLifecycle(
      {
        exposure: 0.9,
        observation: 0.8,
        comprehension: 0.9,
        confidence: 0.85,
        reuse: 0.9,
        stability: 0.2,
      },
      { distinctTextCount: 3, connectedPatternIds: [], exposureCount: 10 },
    );

    expect(lifecycle).not.toBe("mastered");
  });
});
