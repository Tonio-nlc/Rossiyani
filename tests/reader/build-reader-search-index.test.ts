import { describe, expect, it } from "vitest";

import {
  buildReaderSearchIndex,
  searchReaderIndex,
} from "@/lib/reader/build-reader-search-index";
import type { ReaderTextData } from "@/features/texts";

function makeText(): ReaderTextData {
  return {
    id: "text-1",
    title: "Test",
    level: "A1",
    source: null,
    sentences: [
      {
        id: "s1",
        position: 0,
        russianText: "Я люблю яблоко.",
        literalTranslation: "",
        naturalTranslation: "J'aime la pomme.",
        difficultyScore: 0,
        needsReview: false,
        analysisState: "READY",
        phraseGroups: [],
        words: [
          {
            id: "w1",
            position: 0,
            original: "Я",
            stressMarked: "Я",
            stem: "Я",
            ending: "",
            partOfSpeech: "pronoun",
            case: "nominative",
            explanation: "je",
            lemma: "я",
            gender: null,
            number: null,
            tense: null,
            aspect: null,
            frequency: null,
            frequencyTier: null,
            formId: null,
          },
          {
            id: "w2",
            position: 1,
            original: "люблю",
            stressMarked: "люблю́",
            stem: "любл",
            ending: "ю",
            partOfSpeech: "verb",
            case: null,
            explanation: "aimer (1sg présent)",
            lemma: "любить",
            gender: null,
            number: null,
            tense: "present",
            aspect: "imperfective",
            frequency: null,
            frequencyTier: null,
            formId: null,
          },
          {
            id: "w3",
            position: 2,
            original: "яблоко",
            stressMarked: "я́блоко",
            stem: "яблок",
            ending: "о",
            partOfSpeech: "noun",
            case: "accusative",
            explanation: "→ pomme.",
            lemma: "яблоко",
            gender: "neuter",
            number: "singular",
            tense: null,
            aspect: null,
            frequency: null,
            frequencyTier: null,
            formId: null,
          },
        ],
      },
    ],
  };
}

describe("buildReaderSearchIndex", () => {
  it("finds matches by form, lemma, and french gloss", () => {
    const index = buildReaderSearchIndex(makeText());

    expect(searchReaderIndex(index, "люблю").map((entry) => entry.wordId)).toEqual(["w2"]);
    expect(searchReaderIndex(index, "любить").map((entry) => entry.wordId)).toEqual(["w2"]);
    expect(searchReaderIndex(index, "pomme").map((entry) => entry.wordId)).toEqual(["w3"]);
  });

  it("is accent and case insensitive", () => {
    const index = buildReaderSearchIndex(makeText());
    expect(searchReaderIndex(index, "POMME")).toHaveLength(1);
    expect(searchReaderIndex(index, "café")).toHaveLength(0);
  });

  it("searches thousands of words quickly", () => {
    const words = Array.from({ length: 5000 }, (_, index) => ({
      id: `w-${index}`,
      position: index,
      original: `token-${index}-xyz`,
      stressMarked: `token-${index}-xyz`,
      stem: "token",
      ending: "",
      partOfSpeech: "noun",
      case: null,
      explanation: `→ gloss-${index}-xyz.`,
      lemma: `lemma-${index}-xyz`,
      gender: null,
      number: null,
      tense: null,
      aspect: null,
      frequency: null,
      frequencyTier: null,
      formId: null,
    }));

    const text: ReaderTextData = {
      ...makeText(),
      sentences: [{ ...makeText().sentences[0], words }],
    };

    const index = buildReaderSearchIndex(text);
    const start = performance.now();
    const results = searchReaderIndex(index, "token-420-xyz");
    const elapsed = performance.now() - start;

    expect(results).toHaveLength(1);
    expect(elapsed).toBeLessThan(50);
  });
});
