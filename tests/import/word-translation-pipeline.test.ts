import { describe, expect, it } from "vitest";

import { isMeaningfulSentence } from "@/lib/import/is-meaningful-sentence";
import { extractWordTranslationFromRaw } from "@/lib/import/word-translation";
import { parseAnalysisResponse } from "@/services/ai/parse-analysis-response";

describe("isMeaningfulSentence", () => {
  it("rejects whitespace and punctuation-only segments", () => {
    expect(isMeaningfulSentence("")).toBe(false);
    expect(isMeaningfulSentence("   ")).toBe(false);
    expect(isMeaningfulSentence('"')).toBe(false);
    expect(isMeaningfulSentence("…")).toBe(false);
    expect(isMeaningfulSentence("•")).toBe(false);
    expect(isMeaningfulSentence("—")).toBe(false);
    expect(isMeaningfulSentence("...")).toBe(false);
  });

  it("accepts real Russian sentences", () => {
    expect(isMeaningfulSentence("Хотя")).toBe(true);
    expect(isMeaningfulSentence("Привет, мир!")).toBe(true);
  });
});

describe("extractWordTranslationFromRaw", () => {
  it("maps AI translation drift to translationCanonical", () => {
    const result = extractWordTranslationFromRaw({
      original: "Хотя",
      translation: "bien que",
      alternatives: ["quoique"],
    });

    expect(result.translationCanonical).toBe("bien que");
    expect(result.translationAlternatives).toEqual(["quoique"]);
  });
});

describe("parseAnalysisResponse word translation", () => {
  it("preserves word translation through normalize + tolerant parse", () => {
    const payload = {
      russianText: "Хотя.",
      literalTranslation: "Bien que.",
      naturalTranslation: "Bien que.",
      russianLogic: "Concession.",
      orderExplanation: "Ordre.",
      nativeUsageNotes: "Courant.",
      register: "neutral",
      difficultyScore: 2,
      words: [
        {
          position: 0,
          original: "Хотя",
          lemma: "хотя",
          stressMarked: "хотя́",
          stem: "хотя",
          ending: "",
          partOfSpeech: "conjunction",
          explanation: "Conjonction concessive.",
          translation: "bien que",
        },
      ],
      phraseGroups: [],
    };

    const result = parseAnalysisResponse(JSON.stringify(payload));
    expect(result.words[0]?.translationCanonical).toBe("bien que");
  });
});
