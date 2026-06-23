import { describe, expect, it } from "vitest";

import { buildReaderMicroscopeView } from "@/lib/reader/build-reader-microscope-view";
import type { WordDetailGraph } from "@/types/word-detail-graph";

function baseDetail(overrides: Partial<WordDetailGraph> = {}): WordDetailGraph {
  return {
    wordId: "w1",
    textId: "t1",
    sentenceId: "s1",
    occurrence: {
      original: "дома",
      stressMarked: "дома",
      lemma: "дом",
      partOfSpeech: "noun",
      stem: "дом",
      ending: "а",
      case: "genitive",
      gender: "masculine",
      number: "singular",
      tense: null,
      aspect: null,
      explanation: "inanimate noun",
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
      lemma: { frequencyTier: "TOP_1000" } as WordDetailGraph["domain"]["lemma"],
      ending: null,
      case: null,
      concepts: [],
      expression: null,
      collocation: null,
    },
    lemmaKnowledge: {
      lemma: "дом",
      partOfSpeech: "noun",
      stressMarked: null,
      frequency: null,
      frequencyTier: "TOP_1000",
      occurrenceCount: 12,
      canonicalExplanation: null,
      frenchComparison: "maison",
      primaryTranslation: "maison",
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
      seenInTexts: 2,
      relatedTexts: [],
      textsWithStats: [],
      relatedLessons: [],
    },
    endingKnowledge: null,
    phraseKnowledge: null,
    phraseOccurrence: null,
    concepts: [],
    relatedTexts: [],
    examples: [],
    statistics: {
      occurrenceCount: 1,
      seenInTexts: 2,
      libraryHitCount: null,
      collocationCount: null,
    },
    loadedSections: ["basic"],
    ...overrides,
  };
}

describe("buildReaderMicroscopeView", () => {
  it("builds noun morphology and case sections", () => {
    const view = buildReaderMicroscopeView(baseDetail(), { collocationsByLemma: new Map() });

    expect(view.headline).toBe("дома");
    expect(view.lemma).toBe("дом");
    expect(view.metadataLine).toBe("Nom · A2");
    expect(view.translation).toBe("maison");
    expect(view.sections.some((section) => section.id === "noun")).toBe(true);
    expect(view.sections.some((section) => section.id === "case")).toBe(true);
  });

  it("builds verb aspect and conjugation sections", () => {
    const view = buildReaderMicroscopeView(
      baseDetail({
        occurrence: {
          ...baseDetail().occurrence,
          original: "читает",
          lemma: "читать",
          partOfSpeech: "verb",
          aspect: "imperfective",
        },
        lemmaKnowledge: {
          ...baseDetail().lemmaKnowledge!,
          lemma: "читать",
          partOfSpeech: "verb",
          dominantAspect: "imperfective",
          aspectPartner: { lemma: "прочитать", partOfSpeech: "verb", occurrenceCount: 4 },
        },
      }),
      { collocationsByLemma: new Map() },
    );

    expect(view.metadataLine).toBe("Verbe · A2");
    const verb = view.sections.find((section) => section.id === "verb");
    expect(verb?.rows.some((row) => row.label === "Paire d'aspect")).toBe(true);
    expect(verb?.rows.some((row) => row.value.includes("прочитать"))).toBe(true);
  });

  it("builds expression section without pos metadata line", () => {
    const view = buildReaderMicroscopeView(
      baseDetail({
        phraseOccurrence: {
          label: "ни за что",
          type: "FIXED_EXPRESSION",
          explanation: "Sens: absolument pas",
        },
      }),
      { collocationsByLemma: new Map() },
    );

    expect(view.headline).toBe("ни за что");
    expect(view.metadataLine).toBeNull();
    expect(view.sections.some((section) => section.id === "expression")).toBe(true);
  });
});
