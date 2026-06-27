import { describe, expect, it } from "vitest";

import { resolveCompactWordExplanation } from "@/lib/formatting/resolve-word-explanation";
import { resolveEffectiveGender } from "@/lib/formatting/resolve-effective-gender";
import {
  pickReliableExplanationText,
  validateExplanationCandidate,
  WORD_EXPLANATION_EMPTY,
} from "@/lib/formatting/word-explanation-guard";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import { stubLemmaEntity } from "../helpers/lemma-entity-stub";

function minimalDetail(overrides: Partial<WordDetailGraph> = {}): WordDetailGraph {
  return {
    wordId: "w1",
    textId: "t1",
    sentenceId: "s1",
    occurrence: {
      original: "морозная",
      stressMarked: "моро́зная",
      lemma: "морозный",
      partOfSpeech: "adjective",
      stem: "морозн",
      ending: "ая",
      case: "nominative",
      gender: "feminine",
      number: "singular",
      tense: null,
      aspect: null,
      explanation:
        "Adjectif féminin singulier au nominatif, accordé avec le nom qu'il qualifie. → glaciale.",
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
    statistics: { occurrenceCount: 0, seenInTexts: 0, libraryHitCount: null, collocationCount: null },
    loadedSections: ["basic"],
    ...overrides,
  };
}

describe("resolveCompactWordExplanation", () => {
  it("returns at most two sentences from pedagogical source", () => {
    const explanation = resolveCompactWordExplanation(minimalDetail());
    expect(explanation).toContain("Adjectif féminin singulier");
    expect(explanation).toContain("glaciale");
  });

  it("never shows jours when graph-level canonical is contaminated", () => {
    const explanation = resolveCompactWordExplanation(
      minimalDetail({
        occurrence: {
          ...minimalDetail().occurrence,
          original: "яблони",
          lemma: "яблоня",
          partOfSpeech: "noun",
          gender: "masculine",
          explanation: "Forme plurielle.",
        },
        canonicalExplanation: "Nom masculin pluriel signifiant jours.",
        grammaticalReason: "Nom masculin pluriel signifiant jours.",
      }),
    );

    expect(explanation).not.toMatch(/jours/i);
  });

  it("returns — when only contaminated graph-level sources exist", () => {
    const explanation = resolveCompactWordExplanation(
      minimalDetail({
        occurrence: {
          ...minimalDetail().occurrence,
          original: "яблони",
          lemma: "яблоня",
          partOfSpeech: "noun",
          gender: "masculine",
          explanation: "",
        },
        canonicalExplanation: "Nom masculin pluriel signifiant jours.",
        grammaticalReason: "Nom masculin pluriel signifiant jours.",
      }),
    );

    expect(explanation).toBe(WORD_EXPLANATION_EMPTY);
  });

  it("never shows jours for груши when ending knowledge is contaminated", () => {
    const explanation = resolveCompactWordExplanation(
      minimalDetail({
        occurrence: {
          ...minimalDetail().occurrence,
          original: "груши",
          lemma: "груша",
          partOfSpeech: "noun",
          gender: "masculine",
          explanation: "Forme au pluriel.",
        },
        canonicalExplanation: "Nom masculin pluriel signifiant jours.",
        endingKnowledge: {
          ending: "и",
          caseKey: "nominative",
          canonicalExplanation: "Nom masculin pluriel signifiant jours.",
          hitCount: 1,
          concepts: [],
          exampleForms: [],
        },
      }),
    );

    expect(explanation).not.toMatch(/jours/i);
  });

  it("rejects sentence-level explanations for и", () => {
    const explanation = resolveCompactWordExplanation(
      minimalDetail({
        occurrence: {
          ...minimalDetail().occurrence,
          original: "и",
          lemma: "и",
          partOfSpeech: "conjunction",
          gender: null,
          number: null,
          case: null,
          explanation: "Rôle : coordination.",
        },
        canonicalExplanation:
          "Le russe utilise cette phrase pour relier deux propositions dans le texte entier.",
        grammaticalReason:
          "Le russe utilise cette phrase pour relier deux propositions dans le texte entier.",
      }),
    );

    expect(explanation).not.toMatch(/phrase/i);
    expect(explanation).toContain("coordination");
  });

  it("accepts only lemma-bound KnowledgeLemma explanations", () => {
    const explanation = resolveCompactWordExplanation(
      minimalDetail({
        occurrence: {
          ...minimalDetail().occurrence,
          original: "яблони",
          lemma: "яблоня",
          partOfSpeech: "noun",
          explanation: "",
        },
        domain: {
          ...minimalDetail().domain,
          lemma: stubLemmaEntity({
            id: "lemma-1",
            lemma: "яблоня",
            partOfSpeech: "noun",
            canonicalExplanation: "Nom féminin désignant l'arbre fruitier.",
            frenchComparison: "pommier",
          }),
        },
      }),
    );

    expect(explanation).toContain("arbre fruitier");
    expect(explanation).not.toMatch(/jours/i);
  });

  it("rejects KnowledgeLemma explanations bound to a different lemma", () => {
    const accepted = pickReliableExplanationText(
      minimalDetail({
        occurrence: {
          ...minimalDetail().occurrence,
          original: "груши",
          lemma: "груша",
          partOfSpeech: "noun",
          explanation: "",
        },
        domain: {
          ...minimalDetail().domain,
          lemma: stubLemmaEntity({
            id: "lemma-2",
            lemma: "день",
            partOfSpeech: "noun",
            canonicalExplanation: "Nom masculin signifiant jours.",
            frenchComparison: "jour",
          }),
        },
      }),
    );

    expect(accepted).toBeNull();
  });
});

describe("validateExplanationCandidate", () => {
  it("rejects lemma mismatch explicitly", () => {
    const result = validateExplanationCandidate(
      {
        source: "KnowledgeLemma",
        entityId: "lemma-x",
        boundLemma: "день",
        text: "Nom masculin signifiant jours.",
      },
      minimalDetail({
        occurrence: {
          ...minimalDetail().occurrence,
          original: "груши",
          lemma: "груша",
          partOfSpeech: "noun",
        },
      }),
    );

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe("lemma_mismatch");
  });
});

describe("resolveEffectiveGender", () => {
  it("uses feminine gender for яблоня and груша instead of incorrect masculine", () => {
    const apple = resolveEffectiveGender(
      {
        ...minimalDetail().occurrence,
        original: "яблони",
        lemma: "яблоня",
        partOfSpeech: "noun",
        gender: "masculine",
      },
    );
    const pear = resolveEffectiveGender(
      {
        ...minimalDetail().occurrence,
        original: "груши",
        lemma: "груша",
        partOfSpeech: "noun",
        gender: "masculine",
      },
    );

    expect(apple).toBe("feminine");
    expect(pear).toBe("feminine");
  });

  it("prefers KnowledgeForm gender when available", () => {
    const gender = resolveEffectiveGender(
      {
        ...minimalDetail().occurrence,
        original: "груши",
        lemma: "груша",
        partOfSpeech: "noun",
        gender: "masculine",
      },
      {
        domain: {
          form: {
            id: "form-1",
            lemmaId: "lemma-1",
            original: "груши",
            stressMarked: "гру́ши",
            stem: "груш",
            ending: "и",
            partOfSpeech: "noun",
            case: "nominative",
            gender: "feminine",
            number: "plural",
            tense: null,
            aspect: null,
            explanation: "Forme plurielle.",
            canonicalExplanation: null,
            hitCount: 1,
            occurrenceCount: 1,
            reviewStatus: "CANONICAL",
            frequency: null,
            frequencyTier: null,
          },
          lemma: null,
          ending: null,
          case: null,
          concepts: [],
          expression: null,
          collocation: null,
        },
      },
    );

    expect(gender).toBe("feminine");
  });
});
