import { describe, expect, it } from "vitest";

import {
  validateLexicalTranslation,
  validateMorphology,
} from "@/lib/formatting/lexical-validation";
import {
  resolveWordLexicalGlossResult,
  resolveWordLexicalMeanings,
} from "@/lib/formatting/resolve-word-lexical-gloss";
import type { WordDetailGraph } from "@/types/word-detail-graph";

function minimalDetail(overrides: Partial<WordDetailGraph> = {}): WordDetailGraph {
  return {
    wordId: "w1",
    textId: "t1",
    sentenceId: "s1",
    occurrence: {
      original: "тест",
      stressMarked: "тест",
      lemma: "тест",
      partOfSpeech: "noun",
      stem: "тест",
      ending: "",
      case: null,
      gender: null,
      number: null,
      tense: null,
      aspect: null,
      explanation: "",
      frequency: null,
    },
    contextLabel: null,
    canonicalExplanation: "",
    grammaticalReason: "",
    frenchComparison: null,
    frenchComparisonCanonical: null,
    literalTranslation: null,
    naturalTranslation: null,
    domain: {
      form: null,
      lemma: null,
      ending: null,
      case: null,
      concepts: [],
      expression: null,
      collocation: null,
    },
    lemmaKnowledge: null,
    endingKnowledge: null,
    phraseKnowledge: null,
    phraseOccurrence: null,
    concepts: [],
    relatedTexts: [],
    examples: [],
    statistics: {
      occurrenceCount: 0,
      seenInTexts: 0,
      libraryHitCount: null,
      collocationCount: null,
    },
    loadedSections: ["basic"],
    ...overrides,
  };
}

describe("validateLexicalTranslation", () => {
  const rejected = [
    "Adjectif",
    "Verbe",
    "Nom",
    "Adverbe",
    "Préposition",
    "Conjonction",
    "Particule",
    "Pronom",
    "Interjection",
    "Le russe utilise le prépositionnel ici.",
    "Utilisé dans cette phrase pour marquer le temps.",
    "Nom masculin pluriel au génitif.",
    "adjectif",
    "verbe",
    "nom",
  ];

  it.each(rejected)("rejects invalid candidate %s", (candidate) => {
    const result = validateLexicalTranslation(candidate);
    expect(result.accepted).toBe(false);
  });

  const accepted = [
    "pommier",
    "poire",
    "malade",
    "correctement",
    "réussir",
    "fleurir",
    "et",
    "après / derrière",
    "commence",
    "glaciale",
  ];

  it.each(accepted)("accepts valid candidate %s", (candidate) => {
    const result = validateLexicalTranslation(candidate);
    expect(result.accepted).toBe(true);
  });

  it("rejects values longer than 50 characters", () => {
    const result = validateLexicalTranslation("a".repeat(51));
    expect(result.accepted).toBe(false);
    expect(result.reason).toBe("too_long");
  });
});

describe("validateMorphology", () => {
  it("accepts normal morphology labels", () => {
    expect(validateMorphology("Masculin").accepted).toBe(true);
    expect(validateMorphology("Pluriel").accepted).toBe(true);
    expect(validateMorphology("Présent").accepted).toBe(true);
  });

  it("rejects POS labels as morphology values", () => {
    expect(validateMorphology("Adjectif").accepted).toBe(false);
    expect(validateMorphology("Verbe").accepted).toBe(false);
  });
});

describe("resolveWordLexicalGlossResult regression words", () => {
  const cases: Array<{
    original: string;
    lemma: string;
    partOfSpeech: WordDetailGraph["occurrence"]["partOfSpeech"];
    expected: string;
  }> = [
    { original: "яблони", lemma: "яблоня", partOfSpeech: "noun", expected: "pommier" },
    { original: "груши", lemma: "груша", partOfSpeech: "noun", expected: "poire" },
    { original: "правильно", lemma: "правильно", partOfSpeech: "adverb", expected: "correctement" },
    { original: "получится", lemma: "получиться", partOfSpeech: "verb", expected: "réussir" },
    { original: "и", lemma: "и", partOfSpeech: "conjunction", expected: "et" },
    { original: "за", lemma: "за", partOfSpeech: "preposition", expected: "après / derrière" },
    { original: "больных", lemma: "больной", partOfSpeech: "adjective", expected: "malade" },
    { original: "расцветали", lemma: "расцветать", partOfSpeech: "verb", expected: "fleurir" },
  ];

  it.each(cases)("resolves $original → $expected", ({ original, lemma, partOfSpeech, expected }) => {
    const { primaryMeanings } = resolveWordLexicalMeanings(
      minimalDetail({
        occurrence: {
          original,
          stressMarked: original,
          lemma,
          partOfSpeech,
          stem: original,
          ending: "",
          case: null,
          gender: null,
          number: null,
          tense: null,
          aspect: null,
          explanation: "Forme grammaticale.",
          frequency: null,
        },
      }),
    );

    expect(primaryMeanings[0]).toBe(expected);
  });
});

describe("resolveWordLexicalGlossResult rejects grammar labels", () => {
  const invalidExplanations = [
    "Adjectif",
    "Verbe",
    "Nom",
    "Le russe utilise le génitif ici.",
    "Utilisé dans cette phrase pour exprimer la durée.",
    "Nom masculin singulier.",
  ];

  it.each(invalidExplanations)(
    "never uses invalid explanation %s as translation",
    (explanation) => {
      const result = resolveWordLexicalGlossResult(
        minimalDetail({
          occurrence: {
            ...minimalDetail().occurrence,
            original: "xyz",
            lemma: "xyz",
            partOfSpeech: "adjective",
            explanation,
          },
          canonicalExplanation: explanation,
          frenchComparisonCanonical: explanation,
        }),
      );

      expect(result.value).not.toBe("Adjectif");
      expect(result.value).not.toBe("Verbe");
      expect(result.value).not.toBe("Nom");
      expect(result.value).not.toMatch(/^Le russe/i);
      expect(result.value).not.toMatch(/^Utilisé/i);
    },
  );

  it("returns — instead of a POS label for unknown words", () => {
    const result = resolveWordLexicalGlossResult(
      minimalDetail({
        occurrence: {
          ...minimalDetail().occurrence,
          original: "неизвестно",
          lemma: "неизвестно",
          partOfSpeech: "adjective",
          explanation: "Adjectif qualificatif.",
        },
      }),
    );

    expect(result.value).toBe("—");
  });
});
