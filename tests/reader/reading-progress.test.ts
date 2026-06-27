import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearTextReadingProgress,
  formatLastReadLabel,
  getTextReadingProgress,
  isTextReadingComplete,
  renderProgressBlocks,
  upsertReadingProgress,
} from "@/lib/reader/reading-progress";

const STORAGE_KEY = "rossiyani:readingProgress";

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

describe("reading-progress", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores and computes percent from seen words", () => {
    const first = upsertReadingProgress({
      textId: "t1",
      lastSentenceId: "s1",
      seenWordId: "w1",
      totalWords: 4,
      readingTimeDeltaMs: 1000,
    });

    expect(first.wordsSeenIds).toEqual(["w1"]);
    expect(first.percent).toBe(25);

    const second = upsertReadingProgress({
      textId: "t1",
      lastSentenceId: "s1",
      lastWordId: "w2",
      seenWordId: "w2",
      totalWords: 4,
    });

    expect(second.wordsSeenIds).toHaveLength(2);
    expect(second.percent).toBe(50);
    expect(second.readingTimeMs).toBe(1000);
    expect(getTextReadingProgress("t1")?.lastWordId).toBe("w2");
  });

  it("formats last read labels", () => {
    const today = new Date().toISOString();
    expect(formatLastReadLabel(today)).toBe("Aujourd'hui");

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(formatLastReadLabel(yesterday)).toBe("Hier");
  });

  it("renders block progress", () => {
    expect(renderProgressBlocks(81)).toBe("████████░░");
  });

  it("persists in localStorage", () => {
    upsertReadingProgress({
      textId: "t2",
      lastSentenceId: "s9",
      totalWords: 10,
    });

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toContain("t2");
  });

  it("clears stored progress for a deleted text", () => {
    upsertReadingProgress({
      textId: "text-1",
      lastSentenceId: "s1",
      totalWords: 10,
    });
    expect(getTextReadingProgress("text-1")).not.toBeNull();

    clearTextReadingProgress("text-1");
    expect(getTextReadingProgress("text-1")).toBeNull();
  });

  it("detects when all sentences have been seen", () => {
    expect(isTextReadingComplete(null, 3)).toBe(false);

    const partial = upsertReadingProgress({
      textId: "t3",
      lastSentenceId: "s1",
      seenSentenceId: "s1",
      totalWords: 10,
    });
    expect(isTextReadingComplete(partial, 3)).toBe(false);

    const complete = upsertReadingProgress({
      textId: "t3",
      lastSentenceId: "s3",
      seenSentenceId: "s2",
      totalWords: 10,
    });
    const finished = upsertReadingProgress({
      textId: "t3",
      lastSentenceId: "s3",
      seenSentenceId: "s3",
      totalWords: 10,
    });
    expect(isTextReadingComplete(complete, 3)).toBe(false);
    expect(isTextReadingComplete(finished, 3)).toBe(true);
  });
});
