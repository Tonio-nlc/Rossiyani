import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteSavedSentence,
  getSavedSentences,
  isSavedSentence,
  saveSentence,
} from "@/lib/phrase-mining/saved-sentence-storage";

const STORAGE_KEY = "rossiyani:savedSentences";
const LEGACY_KEY = "rossiyani:readerSavedSentences";

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

describe("saved sentence storage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createStorage());
    vi.stubGlobal("crypto", {
      randomUUID: () => "test-uuid",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saves and retrieves a sentence", () => {
    const entry = saveSentence({
      text: "Я читал газету.",
      translation: "Je lisais le journal.",
      sourceTextId: "text-1",
      sourceTextTitle: "В метро",
      collection: "Everyday Russian",
    });

    expect(entry.id).toBe("test-uuid");
    expect(getSavedSentences()).toHaveLength(1);
    expect(isSavedSentence("Я читал газету.", "text-1")).toBe(true);
  });

  it("does not duplicate identical sentences from the same text", () => {
    saveSentence({
      text: "Привет мир.",
      translation: "Bonjour le monde.",
      sourceTextId: "text-2",
      sourceTextTitle: "Dialogue",
      collection: "Telegram",
    });
    saveSentence({
      text: "Привет мир.",
      translation: "Bonjour le monde.",
      sourceTextId: "text-2",
      sourceTextTitle: "Dialogue",
      collection: "Telegram",
    });

    expect(getSavedSentences()).toHaveLength(1);
  });

  it("deletes a saved sentence", () => {
    const entry = saveSentence({
      text: "Как дела?",
      translation: "Comment ça va ?",
      sourceTextId: "text-3",
      sourceTextTitle: "Salutations",
      collection: "",
    });

    deleteSavedSentence(entry.id);
    expect(getSavedSentences()).toHaveLength(0);
  });

  it("migrates legacy reader saved sentences", () => {
    localStorage.setItem(
      LEGACY_KEY,
      JSON.stringify([
        {
          id: "legacy-1",
          russianText: "Старый формат.",
          textId: "legacy-text",
          textTitle: "Legacy",
          savedAt: "2024-01-01T00:00:00.000Z",
        },
      ]),
    );

    const sentences = getSavedSentences();
    expect(sentences).toHaveLength(1);
    expect(sentences[0]?.text).toBe("Старый формат.");
    expect(sentences[0]?.sourceTextId).toBe("legacy-text");
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });
});
