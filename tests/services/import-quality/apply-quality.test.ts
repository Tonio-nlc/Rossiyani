import { describe, expect, it } from "vitest";

import { applyQualityToAnalysis } from "@/services/import-quality/validate-import-text";
import type { ImportTextQualityReport } from "@/services/import-quality/types";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";

const baseAnalysis = {
  russianText: "Тест менусуровизмимним слово.",
  literalTranslation: "Test",
  naturalTranslation: "Test",
  russianLogic: "SVO",
  orderExplanation: "Ordre direct",
  nativeUsageNotes: "Neutre",
  register: "neutral",
  difficultyScore: 2,
  words: [
    {
      position: 0,
      original: "Тест",
      stressMarked: "Тест",
      stem: "Тест",
      ending: "",
      partOfSpeech: "noun",
      case: "NOM",
      gender: "MASC",
      number: "SG",
      lemma: "тест",
      explanation: "mot test",
      tense: null,
      aspect: null,
    },
    {
      position: 1,
      original: "менусуровизмимним",
      stressMarked: "менусуровизмимним",
      stem: "менусур",
      ending: "овизмимним",
      partOfSpeech: "noun",
      case: "NOM",
      gender: null,
      number: null,
      lemma: "менусуровизмимним",
      explanation: "forme douteuse",
      tense: null,
      aspect: null,
    },
    {
      position: 2,
      original: "бббббббббб",
      stressMarked: "бббббббббб",
      stem: "бббб",
      ending: "бббббб",
      partOfSpeech: "noun",
      case: null,
      gender: null,
      number: null,
      lemma: "бббббббббб",
      explanation: "bruit",
      tense: null,
      aspect: null,
    },
  ],
  phraseGroups: [],
  culturalNotes: [],
  needsReview: false,
  analysisStatus: "complete",
  reviewMessage: null,
} satisfies SentenceAnalysisOutput;

const qualityReport: ImportTextQualityReport = {
  tokens: [
    {
      surface: "Тест",
      normalized: "тест",
      status: "KNOWN",
      confidence: 80,
      reasons: [],
      suggestion: null,
      frequency: 1,
    },
    {
      surface: "менусуровизмимним",
      normalized: "менусуровизмимним",
      status: "SUSPICIOUS",
      confidence: 20,
      reasons: ["Longueur inhabituelle"],
      suggestion: null,
      frequency: 1,
    },
    {
      surface: "бббббббббб",
      normalized: "бббббббббб",
      status: "INVALID",
      confidence: 5,
      reasons: ["Répétitions improbables"],
      suggestion: null,
      frequency: 1,
    },
  ],
  knownCount: 1,
  unknownCount: 0,
  suspiciousCount: 1,
  invalidCount: 1,
  invalidSurfaces: ["бббббббббб"],
};

describe("applyQualityToAnalysis", () => {
  it("strips INVALID words and marks SUSPICIOUS ones", () => {
    const result = applyQualityToAnalysis(baseAnalysis, qualityReport);

    expect(result.words).toHaveLength(2);
    expect(result.words.map((w) => w.original)).toEqual(["Тест", "менусуровизмимним"]);
    expect(result.words[1]?.explanation).toContain("[rossiyani:suspicious]");
    expect(result.needsReview).toBe(true);
  });
});
