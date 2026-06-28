import { describe, expect, it } from "vitest";

import {
  buildInteractiveWordsBySentence,
  buildTextWordIndex,
} from "@/lib/reader/build-interactive-words";
import type { ReaderTextData } from "@/features/texts";

const emptyPatternSlice = { patterns: {}, bySentenceId: {} } as const;

const sampleText: ReaderTextData = {
  id: "t1",
  title: "Test",
  level: "B1",
  collectionId: "everyday-russian",
  categoryIds: [],
  patternSlice: emptyPatternSlice,
  sentences: [
    {
      id: "s1",
      position: 0,
      russianText: "Он сидит тихо.",
      literalTranslation: "",
      naturalTranslation: "He sits quietly.",
      russianLogic: "",
      orderExplanation: "",
      nativeUsageNotes: "",
      register: "NEUTRAL",
      difficultyScore: 1,
      needsReview: false,
      analysisState: "READY",
      words: [
        {
          id: "w1",
          position: 0,
          original: "Он",
          stressMarked: "Он",
          stem: "Он",
          ending: "",
          partOfSpeech: "pronoun",
          case: "nominative",
          explanation: "",
          lemma: "он",
          gender: null,
          number: null,
          tense: null,
          aspect: null,
          frequency: null,
          frequencyTier: null,
          formId: "f1",
        },
        {
          id: "w2",
          position: 1,
          original: "сидит",
          stressMarked: "сидит",
          stem: "сид",
          ending: "ит",
          partOfSpeech: "verb",
          case: null,
          explanation: "",
          lemma: "сидеть",
          gender: null,
          number: null,
          tense: "present",
          aspect: null,
          frequency: null,
          frequencyTier: null,
          formId: "f2",
        },
        {
          id: "w3",
          position: 2,
          original: "тихо",
          stressMarked: "тихо",
          stem: "тихо",
          ending: "",
          partOfSpeech: "adverb",
          case: null,
          explanation: "",
          lemma: "тихо",
          gender: null,
          number: null,
          tense: null,
          aspect: null,
          frequency: null,
          frequencyTier: null,
          formId: null,
        },
      ],
      phraseGroups: [],
    },
  ],
};

describe("build-interactive-words", () => {
  it("marks verbs and skips plain pronouns without grammar signal", () => {
    const bySentence = buildInteractiveWordsBySentence(sampleText);
    const interactive = bySentence.get("s1");
    expect(interactive?.has("w2")).toBe(true);
    expect(interactive?.get("w2")).toBe("verb");
    expect(interactive?.has("w1")).toBe(false);
  });

  it("builds a unique word index for the sidebar", () => {
    const bySentence = buildInteractiveWordsBySentence(sampleText);
    const index = buildTextWordIndex(sampleText, bySentence);
    expect(index).toHaveLength(1);
    expect(index[0]?.display).toBe("сидит");
  });
});
