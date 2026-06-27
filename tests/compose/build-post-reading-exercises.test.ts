import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildPostReadingExercises,
  getCompletedReadingTexts,
} from "@/lib/compose/build-post-reading-exercises";

const STORAGE = {
  progress: "rossiyani:readingProgress",
  words: "rossiyani:readerSavedWords",
  sentences: "rossiyani:savedSentences",
};

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

describe("buildPostReadingExercises", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createStorage());

    localStorage.setItem(
      STORAGE.progress,
      JSON.stringify({
        "text-1": {
          textId: "text-1",
          lastSentenceId: "s1",
          lastWordId: null,
          wordsSeenIds: ["w1", "w2"],
          sentencesSeenIds: ["s1", "s2"],
          totalWords: 2,
          percent: 100,
          readingTimeMs: 1000,
          lastReadAt: "2026-06-01T10:00:00.000Z",
        },
      }),
    );

    localStorage.setItem(
      STORAGE.words,
      JSON.stringify([
        {
          id: "word-1",
          displayForm: "читать",
          lemma: "читать",
          textId: "text-1",
          savedAt: "2026-06-01T10:00:00.000Z",
        },
      ]),
    );

    localStorage.setItem(
      STORAGE.sentences,
      JSON.stringify([
        {
          id: "sentence-1",
          text: "Я люблю читать.",
          translation: "J'aime lire.",
          sourceTextId: "text-1",
          sourceTextTitle: "Premier texte",
          collection: "",
          createdAt: "2026-06-01T10:00:00.000Z",
          reviewCount: 0,
          lastReviewedAt: null,
          nextReviewAt: null,
        },
      ]),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists completed texts from reading progress", () => {
    const completed = getCompletedReadingTexts();
    expect(completed).toHaveLength(1);
    expect(completed[0]?.textId).toBe("text-1");
    expect(completed[0]?.textTitle).toBe("Premier texte");
  });

  it("builds translation and reformulation exercises from saved data", () => {
    const exercises = buildPostReadingExercises("text-1");
    expect(exercises.length).toBeGreaterThan(0);
    expect(exercises.some((entry) => entry.type === "translation")).toBe(true);
    expect(exercises.some((entry) => entry.type === "reformulation")).toBe(true);
    expect(exercises[0]?.textTitle).toBe("Premier texte");
  });
});
