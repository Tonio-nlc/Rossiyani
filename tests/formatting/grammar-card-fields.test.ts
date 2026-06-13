import { describe, expect, it } from "vitest";

import {
  buildFunctionWordGrammarFields,
  isInflectedAnalysisPos,
} from "@/lib/formatting/grammar-card-fields";
import type { WordDetailGraph } from "@/types/word-detail-graph";

function minimalDetail(
  overrides: Partial<WordDetailGraph> = {},
): WordDetailGraph {
  return {
    wordId: "w1",
    textId: "t1",
    sentenceId: "s1",
    occurrence: {
      original: "за",
      stressMarked: "за",
      lemma: "за",
      partOfSpeech: "preposition",
      stem: "за",
      ending: "",
      case: null,
      gender: null,
      number: null,
      tense: null,
      aspect: null,
      explanation:
        "Préposition de mouvement. Requiert l'accusatif pour le sens « derrière / après ». Exemple : « за домом ».",
      frequency: null,
    },
    contextLabel: null,
    canonicalExplanation: "",
    grammaticalReason: "",
    frenchComparison: null,
    frenchComparisonCanonical: null,
    literalTranslation: "L'hiver fondait dans notre petite ville.",
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
    examples: ["за домом"],
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

describe("isInflectedAnalysisPos", () => {
  it("treats nouns, adjectives and verbs as inflected", () => {
    expect(isInflectedAnalysisPos("noun")).toBe(true);
    expect(isInflectedAnalysisPos("preposition")).toBe(false);
  });
});

describe("buildFunctionWordGrammarFields", () => {
  it("builds a preposition card with construction from the next word", () => {
    const fields = buildFunctionWordGrammarFields(minimalDetail(), {
      nextWord: {
        original: "домом",
        partOfSpeech: "noun",
        case: "instrumental",
      },
      sentenceRussian: "Таяла зима в нашем городке.",
    });

    expect(fields.find((f) => f.label === "Construction")?.value).toBe(
      "за + instrumental",
    );
    expect(fields.find((f) => f.label === "Exemple")?.value).toBe("за домом");
    expect(fields.find((f) => f.label === "Phrase actuelle")).toBeUndefined();
  });

  it("builds a pronoun card with agreement and examples", () => {
    const fields = buildFunctionWordGrammarFields(
      minimalDetail({
        occurrence: {
          original: "нашем",
          stressMarked: "на́шем",
          lemma: "наш",
          partOfSpeech: "pronoun",
          stem: "наш",
          ending: "ем",
          case: "prepositional",
          gender: "masculine",
          number: "singular",
          tense: null,
          aspect: null,
          explanation: "Pronom possessif.",
          frequency: null,
        },
        examples: ["в нашем городке"],
      }),
    );

    expect(fields.find((f) => f.label === "Type")?.value).toBe("Possessif");
    expect(fields.find((f) => f.label === "Genre")?.value).toBe("Masculin");
    expect(fields.find((f) => f.label === "Exemple")?.value).toBe("в нашем городке");
  });

  it("omits empty fields for conjunctions", () => {
    const fields = buildFunctionWordGrammarFields(
      minimalDetail({
        occurrence: {
          ...minimalDetail().occurrence,
          original: "и",
          lemma: "и",
          partOfSpeech: "conjunction",
          explanation: "Rôle : coordination. Relie deux propositions.",
        },
        examples: [],
      }),
    );

    expect(fields.find((f) => f.label === "Rôle")?.value).toBe("Coordination");
    expect(fields.find((f) => f.label === "Exemple")).toBeUndefined();
  });
});
