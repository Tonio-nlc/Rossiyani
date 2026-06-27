import type { LemmaKnowledge } from "@/types/knowledge-graph";

export function stubLemmaKnowledge(overrides: Partial<LemmaKnowledge> = {}): LemmaKnowledge {
  return {
    lemma: "test",
    partOfSpeech: "noun",
    isProperNoun: false,
    lexicalType: "common_noun",
    stressMarked: null,
    frequency: null,
    frequencyTier: null,
    occurrenceCount: 0,
    canonicalExplanation: null,
    frenchComparison: null,
    primaryTranslation: null,
    secondaryTranslations: [],
    simpleExplanation: null,
    dominantAspect: null,
    aspectPartner: null,
    forms: [],
    concepts: [],
    relatedConcepts: [],
    phrases: [],
    examples: [],
    familyLemmas: [],
    exampleSentences: [],
    seenInTexts: 0,
    relatedTexts: [],
    textsWithStats: [],
    relatedLessons: [],
    ...overrides,
  };
}
