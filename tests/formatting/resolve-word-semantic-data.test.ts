import { describe, expect, it } from "vitest";

import { resolveWordSemanticData } from "@/lib/formatting/resolve-word-semantic-data";
import { buildWordDetail } from "./semantic-fixtures";

describe("resolveWordSemanticData strict rules", () => {
  it("prefers Word.translationCanonical over KnowledgeLemma and dictionary", () => {
    const semantic = resolveWordSemanticData(
      buildWordDetail({
        occurrence: {
          original: "яблони",
          stressMarked: "яблони",
          lemma: "яблоня",
          partOfSpeech: "noun",
          stem: "яблон",
          ending: "и",
          case: null,
          gender: null,
          number: null,
          tense: null,
          aspect: null,
          explanation: "Arbre fruitier.",
          frequency: null,
          translationCanonical: "pommier (occurrence)",
          translationAlternatives: [],
        },
        domain: {
          form: null,
          lemma: {
            id: "l1",
            lemma: "яблоня",
            partOfSpeech: "noun",
            stressMarked: "яблоня",
            frequency: null,
            frequencyTier: null,
            occurrenceCount: 1,
            canonicalExplanation: "Arbre fruitier.",
            frenchComparison: "pommier (knowledge)",
            reviewStatus: "CANONICAL",
          },
          ending: null,
          case: null,
          concepts: [],
          expression: null,
          collocation: null,
        },
      }),
    );

    expect(semantic.translation).toBe("pommier (occurrence)");
    expect(semantic.translationSource).toBe("word");
    expect(semantic.estimated).toBe(false);
  });

  it("uses KnowledgeLemma.frenchComparison when Word has no canonical translation", () => {
    const semantic = resolveWordSemanticData(
      buildWordDetail({
        occurrence: {
          original: "стол",
          stressMarked: "стол",
          lemma: "стол",
          partOfSpeech: "noun",
          stem: "стол",
          ending: "",
          case: null,
          gender: null,
          number: null,
          tense: null,
          aspect: null,
          explanation: "",
          frequency: null,
          translationCanonical: null,
          translationAlternatives: [],
        },
        domain: {
          form: null,
          lemma: {
            id: "l1",
            lemma: "стол",
            partOfSpeech: "noun",
            stressMarked: "стол",
            frequency: null,
            frequencyTier: null,
            occurrenceCount: 1,
            canonicalExplanation: "Meuble avec un plateau horizontal.",
            frenchComparison: "table",
            reviewStatus: "CANONICAL",
          },
          ending: null,
          case: null,
          concepts: [],
          expression: null,
          collocation: null,
        },
      }),
    );

    expect(semantic.translation).toBe("table");
    expect(semantic.translationSource).toBe("KnowledgeLemma");
    expect(semantic.explanation).toContain("Meuble");
  });

  it("never uses canonicalExplanation for translation", () => {
    const semantic = resolveWordSemanticData(
      buildWordDetail({
        canonicalExplanation: "→ pommier",
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
          explanation: "→ poire",
          frequency: null,
          translationCanonical: null,
          translationAlternatives: [],
        },
      }),
    );

    expect(semantic.translation).toBe("—");
  });

  it("never uses frenchComparisonCanonical for translation", () => {
    const semantic = resolveWordSemanticData(
      buildWordDetail({
        frenchComparisonCanonical: "pommier",
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
          explanation: "",
          frequency: null,
          translationCanonical: null,
          translationAlternatives: [],
        },
      }),
    );

    expect(semantic.translation).toBe("—");
    expect(semantic.translationSource).toBe("none");
  });
});
