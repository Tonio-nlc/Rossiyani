import { describe, expect, it } from "vitest";

import { resolveWordFrenchTranslation } from "@/lib/formatting/resolve-word-french-translation";
import {
  resolveWordLexicalGlossResult,
  resolveWordLexicalMeanings,
} from "@/lib/formatting/resolve-word-lexical-gloss";
import { buildWordDetail } from "./semantic-fixtures";
import { stubLemmaEntity } from "../helpers/lemma-entity-stub";

describe("resolveWordFrenchTranslation strict", () => {
  it("never derives translation from explanation arrows", () => {
    const detail = buildWordDetail({
      occurrence: {
        original: "городке",
        stressMarked: "городке",
        lemma: "городок",
        partOfSpeech: "noun",
        stem: "городок",
        ending: "е",
        case: "prepositional",
        gender: "masculine",
        number: "singular",
        tense: null,
        aspect: null,
        explanation: "Petite ville → « dans la petite ville ».",
        frequency: null,
      },
    });

    expect(resolveWordFrenchTranslation(detail)).toBe("petite ville");
  });

  it("uses KnowledgeLemma.frenchComparison when present", () => {
    const detail = buildWordDetail({
      occurrence: {
        original: "городке",
        stressMarked: "городке",
        lemma: "городок",
        partOfSpeech: "noun",
        stem: "городок",
        ending: "е",
        case: "prepositional",
        gender: "masculine",
        number: "singular",
        tense: null,
        aspect: null,
        explanation: "Forme au prépositionnel.",
        frequency: null,
      },
      domain: {
        form: null,
        lemma: stubLemmaEntity({
          id: "lemma-1",
          lemma: "городок",
          partOfSpeech: "noun",
          canonicalExplanation: "Petite localité.",
          frenchComparison: "dans la ville",
        }),
        ending: null,
        case: null,
        concepts: [],
        expression: null,
        collocation: null,
      },
    });

    expect(resolveWordFrenchTranslation(detail)).toBe("dans la ville");
  });

  it("never uses sentence translation as word gloss", () => {
    const detail = buildWordDetail({
      occurrence: {
        original: "xyz",
        stressMarked: "xyz",
        lemma: "xyz",
        partOfSpeech: "noun",
        stem: "xyz",
        ending: "",
        case: null,
        gender: null,
        number: null,
        tense: null,
        aspect: null,
        explanation: "Forme au prépositionnel.",
        frequency: null,
      },
      literalTranslation: "L'hiver fondait dans notre petite ville.",
      naturalTranslation: "L'hiver fondait dans notre petite ville.",
    });

    const result = resolveWordLexicalGlossResult(detail);
    expect(result.value).toBe("—");
    expect(result.value).not.toContain("L'hiver");
  });

  it("uses local dictionary when no lexical graph entry exists", () => {
    const detail = buildWordDetail({
      occurrence: {
        original: "городке",
        stressMarked: "городке",
        lemma: "городок",
        partOfSpeech: "noun",
        stem: "городок",
        ending: "е",
        case: "prepositional",
        gender: "masculine",
        number: "singular",
        tense: null,
        aspect: null,
        explanation: "Cas prépositionnel.",
        frequency: null,
      },
    });

    const result = resolveWordLexicalGlossResult(detail);
    expect(result.source).toBe("dictionary");
    expect(result.isEstimated).toBe(true);
    expect(result.value).toBe("petite ville");
  });
});

describe("dictionary-backed translation words", () => {
  const cases: Array<{
    original: string;
    lemma: string;
    partOfSpeech: import("@/types/domain").PartOfSpeech;
    expected: string;
  }> = [
    { original: "расцветали", lemma: "расцветать", partOfSpeech: "verb", expected: "fleurir" },
    { original: "яблони", lemma: "яблоня", partOfSpeech: "noun", expected: "pommier" },
    { original: "груши", lemma: "груша", partOfSpeech: "noun", expected: "poire" },
    { original: "морозная", lemma: "морозный", partOfSpeech: "adjective", expected: "glaciale" },
    { original: "деревьях", lemma: "дерево", partOfSpeech: "noun", expected: "arbres" },
    { original: "за", lemma: "за", partOfSpeech: "preposition", expected: "après / derrière" },
    { original: "даже", lemma: "даже", partOfSpeech: "particle", expected: "même" },
    { original: "начинает", lemma: "начинать", partOfSpeech: "verb", expected: "commence" },
  ];

  it.each(cases)("resolves $original → $expected from dictionary", ({ original, lemma, partOfSpeech, expected }) => {
    const { primaryMeanings, source, isEstimated } = resolveWordLexicalMeanings(
      buildWordDetail({
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
    expect(source).toBe("dictionary");
    expect(isEstimated).toBe(true);
  });
});
