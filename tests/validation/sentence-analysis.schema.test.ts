import { describe, expect, it } from "vitest";

import { parseAnalysisResponse } from "@/services/ai/parse-analysis-response";
import { parseSentenceAnalysisTolerant } from "@/services/ai/tolerant-sentence-analysis";
import {
  parseSentenceAnalysisOutput,
  safeParseSentenceAnalysisOutput,
} from "@/services/ai/schemas";

const validAnalysis = {
  russianText: "У меня есть брат.",
  literalTranslation: "Il existe un frère à moi.",
  naturalTranslation: "J'ai un frère.",
  russianLogic: "Le russe exprime la possession par l'existence.",
  orderExplanation: "Ordre neutre.",
  nativeUsageNotes: "Extrêmement courant à l'oral, registre neutre.",
  register: "neutral",
  difficultyScore: 2,
  words: [
    {
      position: 0,
      original: "У",
      lemma: "у",
      stressMarked: "У",
      stem: "У",
      ending: "",
      partOfSpeech: "preposition",
      explanation: "Préposition de possession.",
      frequency: "VERY_COMMON",
      frequencyTier: "TOP_500",
    },
    {
      position: 1,
      original: "меня",
      lemma: "я",
      stressMarked: "меня́",
      stem: "мен",
      ending: "я",
      partOfSpeech: "pronoun",
      case: "genitive",
      explanation: "Pronom génitif.",
    },
    {
      position: 2,
      original: "есть",
      lemma: "быть",
      stressMarked: "есть",
      stem: "ест",
      ending: "ь",
      partOfSpeech: "verb",
      tense: "present",
      explanation: "Verbe d'existence.",
    },
    {
      position: 3,
      original: "брат",
      lemma: "брат",
      stressMarked: "брат",
      stem: "брат",
      ending: "",
      partOfSpeech: "noun",
      case: "nominative",
      explanation: "Nom nominatif.",
    },
  ],
  phraseGroups: [
    {
      type: "NATIVE_CONSTRUCTION",
      label: "У меня есть",
      explanation: "Construction de possession.",
      startPosition: 0,
      endPosition: 2,
    },
  ],
  needsReview: false,
  reviewMessage: null,
};

describe("sentenceAnalysisOutputSchema", () => {
  it("accepts a valid analysis payload", () => {
    const result = parseSentenceAnalysisOutput(validAnalysis);
    expect(result.words).toHaveLength(4);
    expect(result.register).toBe("neutral");
  });

  it("normalizes proper noun POS to noun and marks lexical metadata", () => {
    const payload = {
      ...validAnalysis,
      words: validAnalysis.words.map((word, index) =>
        index === 3
          ? {
              ...word,
              original: "Россия",
              lemma: "Россия",
              partOfSpeech: "proper noun",
            }
          : word,
      ),
    };
    const result = parseSentenceAnalysisOutput(payload);
    expect(result.words[3]?.partOfSpeech).toBe("noun");
    expect(result.words[3]?.isProperNoun).toBe(true);
    expect(result.words[3]?.lexicalType).toBe("proper_noun");
  });

  it("accepts stem + ending mismatch without rejecting the word", () => {
    const payload = {
      ...validAnalysis,
      words: validAnalysis.words.map((word, index) =>
        index === 0
          ? { ...word, original: "хлебом", stem: "хлеб", ending: "а" }
          : word,
      ),
    };
    const result = safeParseSentenceAnalysisOutput(payload);
    expect(result.success).toBe(true);
  });
});

describe("parseSentenceAnalysisTolerant", () => {
  it("keeps valid words and marks invalid ones as partial", () => {
    const payload = {
      ...validAnalysis,
      words: [
        ...validAnalysis.words,
        {
          position: 4,
          original: "битый",
          lemma: "",
          stressMarked: "",
          stem: "xxx",
          ending: "yyy",
          partOfSpeech: "not-a-pos",
          explanation: "",
        },
      ],
    };

    const { analysis, partialWordCount } = parseSentenceAnalysisTolerant(payload);
    expect(analysis.words).toHaveLength(5);
    expect(partialWordCount).toBe(1);
    expect(analysis.words[4]?.analysisStatus).toBe("partial");
    expect(analysis.needsReview).toBe(true);
  });

  it("skips punctuation without failing the sentence", () => {
    const payload = {
      ...validAnalysis,
      words: [
        ...validAnalysis.words,
        {
          position: 4,
          original: ".",
          lemma: ".",
          stressMarked: ".",
          stem: ".",
          ending: "",
          partOfSpeech: "particle",
          explanation: "Point.",
        },
      ],
    };

    const { analysis, skippedWordCount } = parseSentenceAnalysisTolerant(payload);
    expect(analysis.words).toHaveLength(4);
    expect(skippedWordCount).toBe(1);
  });

  it("accepts empty words array as partial analysis", () => {
    const payload = {
      ...validAnalysis,
      words: [],
      phraseGroups: [],
      needsReview: true,
    };

    const { analysis } = parseSentenceAnalysisTolerant(payload);
    expect(analysis.words).toEqual([]);
    expect(analysis.analysisStatus).toBe("partial");
    expect(analysis.naturalTranslation).toBe("J'ai un frère.");
  });

  it("schema accepts output with zero words", () => {
    const payload = {
      ...validAnalysis,
      words: [],
      phraseGroups: [],
      analysisStatus: "partial",
      needsReview: true,
    };
    const result = safeParseSentenceAnalysisOutput(payload);
    expect(result.success).toBe(true);
  });
});

describe("parseAnalysisResponse tolerant integration", () => {
  it("parses JSON with one partial word via tolerant path", () => {
    const payload = {
      russianText: "Привет мир.",
      literalTranslation: "Salut monde.",
      naturalTranslation: "Salut le monde.",
      russianLogic: "Note.",
      orderExplanation: "Ordre.",
      nativeUsageNotes: "Courant.",
      register: "neutral",
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
        {
          position: 1,
          original: "мир",
          lemma: "мир",
          stressMarked: "мир",
          stem: "bad",
          ending: "bad",
          partOfSpeech: "not-a-pos",
          explanation: "Nom commun.",
        },
      ],
      phraseGroups: [],
    };

    const result = parseAnalysisResponse(JSON.stringify(payload));
    expect(result.words).toHaveLength(2);
    expect(result.words[1]?.analysisStatus).toBe("partial");
    expect(result.words[1]?.partOfSpeech).toBe("noun");
  });
});
