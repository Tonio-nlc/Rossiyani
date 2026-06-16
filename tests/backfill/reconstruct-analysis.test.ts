import { describe, expect, it } from "vitest";

import { reconstructAnalysisFromSentence } from "@/services/backfill/reconstruct-analysis";

describe("reconstructAnalysisFromSentence", () => {
  it("rebuilds SentenceAnalysisOutput from persisted rows", () => {
    const analysis = reconstructAnalysisFromSentence({
      id: "s1",
      textId: "t1",
      position: 0,
      russianText: "Таяла зима.",
      literalTranslation: "Fondait l'hiver.",
      naturalTranslation: "L'hiver fondait.",
      russianLogic: "Sujet avant verbe.",
      orderExplanation: "Ordre libre.",
      nativeUsageNotes: "Courant.",
      register: "neutral",
      difficultyScore: 2,
      needsReview: false,
      analysisState: "READY",
      reviewMessage: null,
      analysisJson: null,
      syntaxAnalysisJson: null,
      culturalNotesJson: null,
      words: [
        {
          id: "w1",
          sentenceId: "s1",
          formId: null,
          position: 0,
          original: "Таяла",
          lemma: "таять",
          stressMarked: "Таяла",
          stem: "Таял",
          ending: "а",
          partOfSpeech: "verb",
          case: null,
          gender: null,
          number: null,
          tense: "past",
          aspect: "imperfective",
          explanation: "Imparfait.",
          frequency: null,
          frequencyTier: null,
          translationCanonical: "fondait",
          translationAlternatives: null,
        },
      ],
      phraseGroups: [],
    });

    expect(analysis.russianText).toBe("Таяла зима.");
    expect(analysis.words).toHaveLength(1);
    expect(analysis.words[0]?.lemma).toBe("таять");
  });
});
