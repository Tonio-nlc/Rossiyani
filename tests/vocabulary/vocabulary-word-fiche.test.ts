import { describe, expect, it } from "vitest";

import { buildLemmaDefinitions } from "@/lib/explorer/explorer-ia";
import type { LemmaKnowledge } from "@/types/knowledge-graph";

function minimalKnowledge(overrides: Partial<LemmaKnowledge> = {}): LemmaKnowledge {
  return {
    lemma: "дом",
    partOfSpeech: "noun",
    isProperNoun: false,
    lexicalType: null,
    stressMarked: "дом",
    frequency: null,
    frequencyTier: "TOP_1000",
    occurrenceCount: 12,
    canonicalExplanation: "Nom masculin inanimé.",
    frenchComparison: null,
    primaryTranslation: "maison",
    secondaryTranslations: ["foyer"],
    simpleExplanation: "Lieu où l'on habite.",
    dominantAspect: null,
    aspectPartner: null,
    forms: [],
    concepts: [],
    relatedConcepts: [],
    phrases: [],
    examples: [],
    familyLemmas: [],
    exampleSentences: [],
    seenInTexts: 2,
    relatedTexts: [],
    textsWithStats: [],
    relatedLessons: [],
    ...overrides,
  };
}

describe("vocabulary word fiche data", () => {
  it("builds beginner-friendly definitions from lemma knowledge", () => {
    const definitions = buildLemmaDefinitions(minimalKnowledge());
    expect(definitions[0]?.meaning).toBe("maison");
    expect(definitions.some((item) => item.meaning === "foyer")).toBe(true);
    expect(definitions.some((item) => item.note?.includes("habite"))).toBe(true);
  });
});
