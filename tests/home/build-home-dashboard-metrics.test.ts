import { describe, expect, it } from "vitest";

import { buildHomeDashboardMetrics } from "@/lib/home/build-home-dashboard-metrics";

describe("buildHomeDashboardMetrics", () => {
  it("aggregates reading and exploration progress", () => {
    const metrics = buildHomeDashboardMetrics({
      readingProgress: {
        t1: {
          textId: "t1",
          lastSentenceId: "s1",
          lastWordId: "w1",
          wordsSeenIds: ["w1", "w2", "w3"],
          totalWords: 3,
          percent: 100,
          lastReadAt: "2026-01-01T00:00:00.000Z",
        },
        t2: {
          textId: "t2",
          lastSentenceId: "s2",
          lastWordId: "w4",
          wordsSeenIds: ["w4"],
          totalWords: 10,
          percent: 10,
          lastReadAt: "2026-01-02T00:00:00.000Z",
        },
      },
      exploration: [
        {
          id: "1",
          label: "Genitive case",
          href: "/explorer/cases/genitive",
          kind: "case",
          visitedAt: "2026-01-02T00:00:00.000Z",
        },
        {
          id: "2",
          label: "Motion verbs",
          href: "/explorer/concepts/motion-verbs",
          kind: "concept",
          visitedAt: "2026-01-02T00:00:00.000Z",
        },
      ],
      savedWords: [],
      streak: {
        currentStreak: 3,
        weeklyActivity: [true, true, true, false, false, false, false],
        wordsToday: 2,
      },
    });

    expect(metrics.wordsExplored).toBe(4);
    expect(metrics.textsCompleted).toBe(1);
    expect(metrics.conceptsExplored).toBe(2);
    expect(metrics.currentStreak).toBe(3);
    expect(metrics.isReturning).toBe(true);
  });
});
