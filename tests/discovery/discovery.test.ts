import { describe, expect, it } from "vitest";

import { discoverySeed, getDateKey, hashString, seededIndex } from "@/features/discovery/discovery-seed";
import { freshnessScore } from "@/features/discovery/freshness-score";
import { scoreCandidate } from "@/features/discovery/score-candidate";
import type { FeaturedCandidateRow, LearningSignals } from "@/features/discovery/types";
import { EMPTY_LEARNING_SIGNALS } from "@/features/discovery/types";

const baseCandidate: FeaturedCandidateRow = {
  id: "c1",
  type: "WORD",
  lemma: "добираться",
  frequency: 80,
  register: "neutral",
  difficulty: "B1",
  topics: ["motion"],
  relations: ["ехать", "идти"],
  qualityScore: 85,
  lastFeatured: null,
  manualPriority: 0,
  subtitle: "to get to",
  explanation: null,
  exampleRussian: null,
  exampleTranslation: null,
  explorerHref: null,
  practiceHref: null,
  readExamplesHref: null,
  partOfSpeech: "verb",
};

describe("discoverySeed", () => {
  it("is stable for the same learner and date", () => {
    const first = discoverySeed("learner-a", "2026-06-06");
    const second = discoverySeed("learner-a", "2026-06-06");
    expect(first).toBe(second);
  });

  it("changes when the date changes", () => {
    const today = discoverySeed("learner-a", "2026-06-06");
    const tomorrow = discoverySeed("learner-a", "2026-06-07");
    expect(today).not.toBe(tomorrow);
  });
});

describe("freshnessScore", () => {
  const now = new Date("2026-06-12T12:00:00").getTime();

  it("rewards never-seen discoveries", () => {
    expect(freshnessScore(baseCandidate, EMPTY_LEARNING_SIGNALS, now)).toBe(100);
  });

  it("penalizes discoveries seen this week", () => {
    const signals: LearningSignals = {
      ...EMPTY_LEARNING_SIGNALS,
      discoveryArchive: [{ candidateId: "c1", dateKey: "2026-06-10" }],
      featuredHistory: ["c1"],
    };
    expect(freshnessScore(baseCandidate, signals, now)).toBe(-100);
  });

  it("rewards discoveries last seen 90+ days ago", () => {
    const signals: LearningSignals = {
      ...EMPTY_LEARNING_SIGNALS,
      discoveryArchive: [{ candidateId: "c1", dateKey: "2026-02-01" }],
      featuredHistory: ["c1"],
    };
    expect(freshnessScore(baseCandidate, signals, now)).toBe(40);
  });

  it("rewards discoveries last seen 180+ days ago", () => {
    const signals: LearningSignals = {
      ...EMPTY_LEARNING_SIGNALS,
      discoveryArchive: [{ candidateId: "c1", dateKey: "2025-11-01" }],
      featuredHistory: ["c1"],
    };
    expect(freshnessScore(baseCandidate, signals, now)).toBe(60);
  });
});

describe("scoreCandidate", () => {
  it("boosts related motion vocabulary when the learner explored motion verbs", () => {
    const signals: LearningSignals = {
      ...EMPTY_LEARNING_SIGNALS,
      exploredLemmas: ["ехать", "идти"],
      recentTopics: ["motion"],
    };

    const score = scoreCandidate(baseCandidate, signals);
    const coldScore = scoreCandidate(baseCandidate, EMPTY_LEARNING_SIGNALS);
    expect(score).toBeGreaterThan(coldScore);
  });

  it("penalizes mastered lemmas", () => {
    const signals: LearningSignals = {
      ...EMPTY_LEARNING_SIGNALS,
      exploredLemmas: ["добираться", "добираться", "добираться"],
    };

    const score = scoreCandidate(baseCandidate, signals);
    const freshScore = scoreCandidate(baseCandidate, EMPTY_LEARNING_SIGNALS);
    expect(score).toBeLessThan(freshScore);
  });
});

describe("seededIndex", () => {
  it("selects deterministically within bounds", () => {
    const seed = hashString("test");
    const index = seededIndex(seed, 5);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(5);
  });
});

describe("getDateKey", () => {
  it("returns YYYY-MM-DD", () => {
    expect(getDateKey(new Date("2026-06-06T15:00:00"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
