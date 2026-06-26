import { describe, expect, it } from "vitest";

import { buildSessionJournal } from "@/lib/home/build-session-journal";

const baseJournal = {
  todaysDiscovery: null,
  review: {
    words: [{ label: "МЕТРО", href: "/explorer/lemmas/metro/noun", count: 2 }],
    moreCount: 3,
  },
  featuredLesson: {
    slug: "accent-tonique",
    title: "Accent tonique",
    description: "Les règles de l'accent en russe.",
    readingMinutes: 8,
    levelLabel: "A1",
    href: "/lessons/lecons/accent-tonique",
    dateKey: "2026-06-15",
  },
  featuredPractice: {
    title: "Pratiquer несмотря на",
    description: "Écrire une phrase contrastée.",
    estimatedMinutes: 3,
    href: "/practice?structure=несмотря%20на",
    source: "related" as const,
  },
  reviewHref: "/explorer/lemmas",
};

describe("buildSessionJournal", () => {
  it("assembles a narrative from server and local signals", () => {
    const narrative = buildSessionJournal({
      journal: baseJournal,
      texts: [
        {
          id: "text-1",
          title: "В метро",
          level: "A2",
          collectionId: "everyday-russian",
          categoryIds: [],
          sentenceCount: 40,
          createdAt: new Date(),
        },
      ],
      signals: {
        exploredLemmas: ["станция"],
        exploredConcepts: [],
        exploredPhrases: [],
        readTextIds: ["text-1"],
        practiceStructures: [],
        savedPhraseTexts: [],
        recentTopics: [],
        discoveryArchive: [],
        recentManualLessonSlugs: [],
        featuredHistory: [],
      },
      savedWords: [
        {
          id: "w1",
          displayForm: "станцией",
          lemma: "станция",
          textId: "text-1",
          savedAt: "2026-06-15T10:00:00.000Z",
        },
      ],
      savedDiscoveries: [],
      exploration: [
        {
          id: "e1",
          label: "станция",
          href: "/explorer/lemmas/station/noun",
          kind: "lemma",
          visitedAt: "2026-06-15T11:00:00.000Z",
        },
      ],
      discoveryArchive: [],
      savedPhrases: [],
      readingProgress: {
        "text-1": {
          textId: "text-1",
          lastSentenceId: "s1",
          lastWordId: "w1",
          wordsSeenIds: ["w1", "w2"],
          sentencesSeenIds: ["s1"],
          totalWords: 100,
          percent: 42,
          readingTimeMs: 120000,
          lastReadAt: "2026-06-15T12:00:00.000Z",
        },
      },
    });

    expect(narrative.continueReading?.label).toBe("В метро");
    expect(narrative.recentlyLearned.some((entry) => entry.label === "станция")).toBe(true);
    expect(narrative.toReview.some((entry) => entry.label === "МЕТРО")).toBe(true);
    expect(narrative.nextStep).not.toBeNull();
    expect(narrative.why.length).toBeGreaterThan(0);
  });
});
