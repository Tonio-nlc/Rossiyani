import { describe, expect, it } from "vitest";

import { applySrsReview, isDue } from "@/lib/review/srs";
import type { ReviewItemRecord } from "@/lib/review/types";

function baseItem(overrides: Partial<ReviewItemRecord> = {}): ReviewItemRecord {
  return {
    id: "item-1",
    type: "vocabulary",
    sourceKey: "vocabulary:word-1",
    content: {
      prompt: "читать",
      answer: "lire",
      hint: null,
      exampleRussian: null,
      exampleTranslation: null,
      partOfSpeech: null,
      sourceTextId: null,
      sourceTextTitle: null,
      sourceTextHref: null,
      vocabularyHref: null,
      audioTarget: null,
    },
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    state: "new",
    nextReviewAt: new Date().toISOString(),
    lastReviewedAt: null,
    suspended: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("applySrsReview", () => {
  const now = new Date("2026-06-27T12:00:00.000Z");

  it("resets learning on again with short interval", () => {
    const result = applySrsReview(baseItem({ repetitions: 2, intervalDays: 6 }), "again", now);
    expect(result.state).toBe("learning");
    expect(result.repetitions).toBe(0);
    expect(result.intervalDays).toBe(0);
    const next = new Date(result.nextReviewAt);
    expect(next.getTime() - now.getTime()).toBe(10 * 60_000);
  });

  it("schedules first good review in one day", () => {
    const result = applySrsReview(baseItem(), "good", now);
    expect(result.state).toBe("review");
    expect(result.repetitions).toBe(1);
    expect(result.intervalDays).toBe(1);
  });

  it("marks mastered after long interval and repetitions", () => {
    const result = applySrsReview(
      baseItem({ repetitions: 2, intervalDays: 15, state: "review" }),
      "good",
      now,
    );
    expect(result.state).toBe("mastered");
    expect(result.repetitions).toBe(3);
    expect(result.intervalDays).toBeGreaterThanOrEqual(21);
  });
});

describe("isDue", () => {
  it("ignores suspended items", () => {
    const item = baseItem({
      suspended: true,
      nextReviewAt: new Date(0).toISOString(),
    });
    expect(isDue(item, new Date())).toBe(false);
  });

  it("returns true when next review is in the past", () => {
    const item = baseItem({ nextReviewAt: new Date(0).toISOString() });
    expect(isDue(item, new Date())).toBe(true);
  });
});
