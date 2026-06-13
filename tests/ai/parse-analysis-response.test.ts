import { describe, expect, it } from "vitest";

import { parseAnalysisResponse } from "@/services/ai/parse-analysis-response";

const minimalValid = {
  russianText: "Привет.",
  literalTranslation: "Salut.",
  naturalTranslation: "Salut.",
  russianLogic: "Note.",
  orderExplanation: "Ordre.",
  nativeUsageNotes: "Courant à l'oral.",
  register: "informal",
  difficultyScore: 1,
  words: [
    {
      position: 0,
      original: "Привет",
      lemma: "привет",
      stressMarked: "приве́т",
      stem: "Привет",
      ending: "",
      partOfSpeech: "noun",
      explanation: "Salutation.",
    },
  ],
  phraseGroups: [],
};

describe("parseAnalysisResponse", () => {
  it("parses raw JSON", () => {
    const result = parseAnalysisResponse(JSON.stringify(minimalValid));
    expect(result.russianText).toBe("Привет.");
  });

  it("accepts words=[] with translations as partial", () => {
    const payload = {
      ...minimalValid,
      words: [],
      phraseGroups: [],
    };
    const result = parseAnalysisResponse(JSON.stringify(payload), {
      russianText: "Привет.",
    });
    expect(result.words).toEqual([]);
    expect(result.analysisStatus).toBe("partial");
    expect(result.naturalTranslation).toBe("Salut.");
  });
});
