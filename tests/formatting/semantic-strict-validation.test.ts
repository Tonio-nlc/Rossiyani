import { describe, expect, it } from "vitest";

import { buildMorphologyDisplayFields } from "@/lib/formatting/word-morphology-display";
import { resolveWordSemanticData } from "@/lib/formatting/resolve-word-semantic-data";
import { isInternalUiPlaceholder } from "@/lib/formatting/ui-placeholder-guard";
import {
  ALL_SEMANTIC_FIXTURES,
  buildWordDetail,
  fixtureToDetail,
} from "./semantic-fixtures";
import { stubLemmaEntity } from "../helpers/lemma-entity-stub";

describe("semantic strict validation suite", () => {
  it("covers at least 100 words", () => {
    expect(ALL_SEMANTIC_FIXTURES.length).toBeGreaterThanOrEqual(100);
  });

  it.each(ALL_SEMANTIC_FIXTURES.map((f) => [f.id, f] as const))(
    "%s respects strict translation and explanation rules",
    (_id, fixture) => {
      const detail = fixtureToDetail(fixture);
      const semantic = resolveWordSemanticData(detail);

      expect(semantic.translation).toBe(fixture.expectedTranslation);
      expect(semantic.translationSource).toBe(fixture.translationSource);

      if (fixture.expectedTranslation === "—") {
        expect(semantic.translation).toBe("—");
      } else {
        expect(semantic.translation).not.toBe("—");
      }

      for (const field of Object.values(semantic.morphology)) {
        if (field !== null && field !== undefined) {
          expect(String(field).toLowerCase()).not.toBe("null");
        }
      }

      if (semantic.explanation !== "—") {
        expect(isInternalUiPlaceholder(semantic.explanation)).toBe(false);
        expect(semantic.explanation.toLowerCase()).not.toContain("null");
      }
    },
  );
});

describe("semantic contamination guards", () => {
  it("never shows jours in pronoun translation", () => {
    const pronouns = ALL_SEMANTIC_FIXTURES.filter((f) => f.partOfSpeech === "pronoun");
    for (const fixture of pronouns) {
      const semantic = resolveWordSemanticData(
        fixtureToDetail({
          ...fixture,
          explanation: "Se réfère aux jours de la semaine de travail.",
          canonicalExplanation: "Nom masculin pluriel signifiant jours.",
        }),
      );
      expect(semantic.translation.toLowerCase()).not.toContain("jour");
    }
  });

  it("never uses neighbor noun translation for a demonstrative", () => {
    const semantic = resolveWordSemanticData(
      buildWordDetail({
        occurrence: {
          original: "этот",
          stressMarked: "этот",
          lemma: "этот",
          partOfSpeech: "pronoun",
          stem: "эт",
          ending: "от",
          case: null,
          gender: "masculine",
          number: "singular",
          tense: null,
          aspect: null,
          explanation: "Pronom démonstratif proche.",
          frequency: null,
        },
        canonicalExplanation: "Nom masculin singulier signifiant pommier.",
        frenchComparisonCanonical: "pommier",
        domain: {
          form: null,
          lemma: stubLemmaEntity({
            id: "l-demo",
            lemma: "этот",
            partOfSpeech: "pronoun",
            canonicalExplanation: "Pronom démonstratif.",
            frenchComparison: null,
            lexicalType: "pronoun",
          }),
          ending: null,
          case: null,
          concepts: [],
          expression: null,
          collocation: null,
        },
      }),
    );

    expect(semantic.translation).toBe("—");
    expect(semantic.translation).not.toContain("pommier");
  });

  it("never derives translation from explanation when no lexical source exists", () => {
    const semantic = resolveWordSemanticData(
      buildWordDetail({
        occurrence: {
          original: "абракадабра",
          stressMarked: "абракадабра",
          lemma: "абракадабра",
          partOfSpeech: "noun",
          stem: "абра",
          ending: "кадабра",
          case: null,
          gender: null,
          number: null,
          tense: null,
          aspect: null,
          explanation: 'Nom signifiant "fumée", utilisé ici pour décrire un reste intangible.',
          frequency: null,
        },
      }),
    );

    expect(semantic.translation).toBe("—");
    expect(semantic.translationSource).toBe("none");
    expect(semantic.explanation).toContain("fumée");
  });

  it("shows — when no lexical source exists even with rich explanation", () => {
    const semantic = resolveWordSemanticData(
      buildWordDetail({
        occurrence: {
          original: "абракадабра",
          stressMarked: "абракадабра",
          lemma: "абракадабра",
          partOfSpeech: "noun",
          stem: "абра",
          ending: "кадабра",
          case: null,
          gender: null,
          number: null,
          tense: null,
          aspect: null,
          explanation: 'Nom signifiant "sortilège".',
          frequency: null,
        },
      }),
    );

    expect(semantic.translation).toBe("—");
    expect(semantic.translationSource).toBe("none");
    expect(semantic.explanation).toContain("sortilège");
  });

  it("rejects internal placeholders in explanation", () => {
    const semantic = resolveWordSemanticData(
      buildWordDetail({
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
          explanation: "Analyse partielle — champs minimaux uniquement.",
          frequency: null,
        },
      }),
    );

    expect(semantic.explanation).toBe("—");
  });

  it("hides null morphology values from display fields", () => {
    const fields = buildMorphologyDisplayFields({
      original: "он",
      stressMarked: "он",
      lemma: "он",
      partOfSpeech: "pronoun",
      stem: "он",
      ending: "",
      case: "null",
      gender: "null",
      number: null,
      tense: null,
      aspect: null,
      explanation: "",
      frequency: null,
    });

    for (const field of fields) {
      expect(field.value.toLowerCase()).not.toBe("null");
    }
  });
});
