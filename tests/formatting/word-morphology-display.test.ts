import { describe, expect, it } from "vitest";

import {
  buildMorphologyDisplayFields,
  shouldShowLemma,
  shouldShowStress,
} from "@/lib/formatting/word-morphology-display";
import type { WordOccurrenceContext } from "@/types/knowledge-workspace";

const baseOccurrence: WordOccurrenceContext = {
  original: "городке",
  stressMarked: "городке́",
  lemma: "городок",
  partOfSpeech: "noun",
  stem: "городок",
  ending: "е",
  case: "prepositional",
  gender: "masculine",
  number: "singular",
  tense: null,
  aspect: null,
  explanation: "…",
  frequency: null,
};

describe("buildMorphologyDisplayFields", () => {
  it("shows case for nouns but not for verbs", () => {
    const nounFields = buildMorphologyDisplayFields(baseOccurrence);
    expect(nounFields.map((f) => f.label)).toEqual([
      "Lemme",
      "Genre",
      "Nombre",
      "Cas",
    ]);

    const verbFields = buildMorphologyDisplayFields({
      ...baseOccurrence,
      original: "Таяла",
      partOfSpeech: "verb",
      case: null,
      gender: null,
      tense: "past",
      aspect: "imperfective",
      number: "singular",
    });
    expect(verbFields.map((f) => f.label)).not.toContain("Cas");
    expect(verbFields.map((f) => f.label)).toEqual(
      expect.arrayContaining(["Temps", "Aspect", "Nombre"]),
    );
  });

  it("omits empty morphology values", () => {
    const fields = buildMorphologyDisplayFields({
      ...baseOccurrence,
      gender: null,
      number: null,
      case: null,
    });
    expect(fields.map((f) => f.label)).toEqual(["Lemme"]);
  });
});

describe("shouldShowLemma", () => {
  it("hides lemma when identical to surface form", () => {
    expect(
      shouldShowLemma({
        ...baseOccurrence,
        original: "зима",
        lemma: "зима",
      }),
    ).toBe(false);
  });
});

describe("shouldShowStress", () => {
  it("shows accent when stress marks differ from original", () => {
    expect(shouldShowStress(baseOccurrence)).toBe(true);
    expect(
      shouldShowStress({
        ...baseOccurrence,
        original: "зима",
        stressMarked: "зима",
      }),
    ).toBe(false);
  });
});
