import { describe, expect, it } from "vitest";

import {
  countLearnableWordsSeen,
  isLearnableLemma,
  partOfSpeechToLexicalType,
  resolveWordLexicalMetadata,
} from "@/lib/linguistics/lexical-metadata";

describe("lexical-metadata", () => {
  it("treats only explicit proper nouns as non-learnable", () => {
    expect(isLearnableLemma({ isProperNoun: true })).toBe(false);
    expect(isLearnableLemma({ isProperNoun: false })).toBe(true);
    expect(isLearnableLemma({ isProperNoun: null })).toBe(true);
    expect(isLearnableLemma({})).toBe(true);
  });

  it("maps part of speech to lexical type", () => {
    expect(partOfSpeechToLexicalType("noun", false)).toBe("common_noun");
    expect(partOfSpeechToLexicalType("noun", true)).toBe("proper_noun");
    expect(partOfSpeechToLexicalType("preposition", false)).toBe("other");
  });

  it("resolves explicit isProperNoun flag", () => {
    expect(
      resolveWordLexicalMetadata({
        partOfSpeech: "noun",
        isProperNoun: true,
      }),
    ).toEqual({ isProperNoun: true, lexicalType: "proper_noun" });
  });

  it("counts learnable words seen with backward-compatible fallback", () => {
    expect(
      countLearnableWordsSeen({
        wordsSeenIds: ["a", "b", "c"],
        learnableWordsSeenIds: ["a", "c"],
      }),
    ).toBe(2);

    expect(
      countLearnableWordsSeen({
        wordsSeenIds: ["a", "b"],
      }),
    ).toBe(2);
  });
});
