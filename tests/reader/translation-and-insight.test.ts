import { describe, expect, it } from "vitest";

import { buildReaderSentenceInsight } from "@/lib/reader/build-reader-sentence-insight";
import {
  resolveTranslationVisible,
  shouldShowTranslationToggle,
} from "@/lib/reader/translation-display-preference";

describe("translation-display-preference", () => {
  it("resolves visibility per mode", () => {
    const expanded = new Set(["s1"]);

    expect(resolveTranslationVisible("s1", "hidden", expanded)).toBe(false);
    expect(resolveTranslationVisible("s2", "manual", expanded)).toBe(false);
    expect(resolveTranslationVisible("s1", "manual", expanded)).toBe(true);
    expect(resolveTranslationVisible("s2", "all", expanded)).toBe(true);
  });

  it("shows per-sentence toggles only in manual mode", () => {
    expect(shouldShowTranslationToggle("manual")).toBe(true);
    expect(shouldShowTranslationToggle("hidden")).toBe(false);
    expect(shouldShowTranslationToggle("all")).toBe(false);
  });
});

describe("buildReaderSentenceInsight", () => {
  it("builds sections from sentence pedagogical fields", () => {
    const insight = buildReaderSentenceInsight({
      id: "s1",
      position: 1,
      russianText: "Привет.",
      literalTranslation: "Salut.",
      naturalTranslation: "Bonjour.",
      russianLogic: "Salutation simple. Courante à l'oral.",
      orderExplanation: "Ordre neutre sujet-verbe.",
      nativeUsageNotes: "Registre familier.",
      register: "NEUTRAL",
      difficultyScore: 1,
      needsReview: false,
      analysisState: "READY",
      words: [],
      phraseGroups: [
        {
          id: "g1",
          type: "FIXED_EXPRESSION",
          label: "привет",
          explanation: "Formule de salutation informelle.",
          startPosition: 0,
          endPosition: 0,
        },
      ],
    });

    expect(insight.available).toBe(true);
    expect(insight.sections.map((section) => section.id)).toEqual([
      "logic",
      "order",
      "construction-g1",
      "usage",
    ]);
  });

  it("returns unavailable when no displayable content exists", () => {
    const insight = buildReaderSentenceInsight({
      id: "s2",
      position: 2,
      russianText: "Да.",
      literalTranslation: "",
      naturalTranslation: "Oui.",
      russianLogic: "",
      orderExplanation: "",
      nativeUsageNotes: "",
      register: "NEUTRAL",
      difficultyScore: 1,
      needsReview: false,
      analysisState: "READY",
      words: [],
      phraseGroups: [],
    });

    expect(insight.available).toBe(false);
    expect(insight.sections).toEqual([]);
  });
});
