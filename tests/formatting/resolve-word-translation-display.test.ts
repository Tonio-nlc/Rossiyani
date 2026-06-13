import { describe, expect, it } from "vitest";

import { resolveWordTranslationDisplay } from "@/lib/formatting/resolve-word-translation-display";
import { buildWordDetail } from "./semantic-fixtures";

describe("resolveWordTranslationDisplay strict", () => {
  it("uses KnowledgeLemma.frenchComparison", () => {
    const display = resolveWordTranslationDisplay(
      buildWordDetail({
        occurrence: {
          original: "иного",
          stressMarked: "иного",
          lemma: "иной",
          partOfSpeech: "adjective",
          stem: "ин",
          ending: "ого",
          case: "genitive",
          gender: "masculine",
          number: "singular",
          tense: null,
          aspect: null,
          explanation: "Forme au génitif singulier de « иной » → autre / différent.",
          frequency: null,
        },
        domain: {
          form: null,
          lemma: {
            id: "l1",
            lemma: "иной",
            partOfSpeech: "adjective",
            stressMarked: "иной",
            frequency: null,
            frequencyTier: null,
            occurrenceCount: 1,
            canonicalExplanation: null,
            frenchComparison: "autre",
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

    expect(display.primaryMeanings).toEqual(["autre"]);
    expect(display.isEstimated).toBe(false);
    expect(display.source).toBe("KnowledgeLemma");
    expect(display.posEmoji).toBe("❄");
  });

  it("falls back to dictionary, not explanation", () => {
    const display = resolveWordTranslationDisplay(
      buildWordDetail({
        occurrence: {
          original: "иного",
          stressMarked: "иного",
          lemma: "иной",
          partOfSpeech: "adjective",
          stem: "ин",
          ending: "ого",
          case: "genitive",
          gender: "masculine",
          number: "singular",
          tense: null,
          aspect: null,
          explanation: "Forme au génitif singulier de « иной » → autre / différent.",
          frequency: null,
        },
      }),
    );

    expect(display.primaryMeanings).toEqual(["autre"]);
    expect(display.source).toBe("dictionary");
    expect(display.isEstimated).toBe(true);
  });

  it("uses KnowledgeForm path only via explicit lemma frenchComparison", () => {
    const fromLemma = resolveWordTranslationDisplay(
      buildWordDetail({
        occurrence: {
          original: "иного",
          stressMarked: "иного",
          lemma: "иной",
          partOfSpeech: "adjective",
          stem: "ин",
          ending: "ого",
          case: "genitive",
          gender: "masculine",
          number: "singular",
          tense: null,
          aspect: null,
          explanation: "Forme au génitif.",
          frequency: null,
        },
        domain: {
          form: null,
          lemma: {
            id: "l1",
            lemma: "иной",
            partOfSpeech: "adjective",
            stressMarked: "иной",
            frequency: null,
            frequencyTier: null,
            occurrenceCount: 1,
            canonicalExplanation: null,
            frenchComparison: "autre",
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

    expect(fromLemma.primaryMeanings).toEqual(["autre"]);
    expect(fromLemma.source).toBe("KnowledgeLemma");
  });

  it("never uses sentence translation", () => {
    const display = resolveWordTranslationDisplay(
      buildWordDetail({
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
          explanation: "Forme au génitif.",
          frequency: null,
        },
        literalTranslation: "Il ... et d'autres personnes ...",
        naturalTranslation: "Il ... et d'autres personnes ...",
      }),
    );

    expect(display.primaryMeanings).toEqual(["—"]);
    expect(display.source).toBe("none");
  });
});

describe("Traduction indisponible", () => {
  it("does not exist anywhere in the formatting layer", async () => {
    const glob = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/lib/formatting/resolve-word-semantic-data.ts", "utf8"),
    );
    expect(glob).not.toContain("Traduction indisponible");
  });
});
