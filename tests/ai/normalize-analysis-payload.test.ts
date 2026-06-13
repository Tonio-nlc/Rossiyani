import { describe, expect, it } from "vitest";

import { normalizeAnalysisPayload } from "@/services/ai/normalize-analysis-payload";
import { parseSentenceAnalysisOutput } from "@/services/ai/schemas";

/** OpenAI-shaped payload from real import failure (abbreviated). */
const openAiPayload = {
  russianText: "Таяла зима в нашем городке.",
  literalTranslation: "Fondait hiver dans notre petite ville.",
  naturalTranslation: "L'hiver fondait dans notre petite ville.",
  russianLogic: "En russe, l'action de fondre précède l'information de lieu.",
  orderExplanation: "L'ordre des mots commence par le verbe.",
  nativeUsageNotes: "Exemple poétique ou descriptif.",
  register: "literary",
  difficultyScore: 3,
  words: [
    {
      position: 0,
      original: "Таяла",
      lemma: "таять",
      stressMarked: "Тая́ла",
      stem: "таял",
      ending: "а",
      partOfSpeech: "verb",
      explanation: "Verbe.",
    },
    {
      position: 1,
      original: "зима",
      lemma: "зима",
      stressMarked: "зима́",
      stem: "зим",
      ending: "а",
      partOfSpeech: "noun",
      explanation: "Nom.",
    },
    {
      position: 2,
      original: "в",
      lemma: "в",
      stressMarked: "в",
      stem: "в",
      ending: "",
      partOfSpeech: "preposition",
      explanation: "Préposition.",
    },
    {
      position: 3,
      original: "нашем",
      lemma: "наш",
      stressMarked: "на́шем",
      stem: "наш",
      ending: "ем",
      partOfSpeech: "pronoun",
      explanation: "Pronom.",
    },
    {
      position: 4,
      original: "городке",
      lemma: "городок",
      stressMarked: "городке́",
      stem: "городк",
      ending: "е",
      partOfSpeech: "noun",
      explanation: "Nom.",
    },
  ],
  phraseGroups: [
    {
      type: "NATIVE_CONSTRUCTION",
      indices: [0, 1],
      explanation: "Verbe puis sujet.",
    },
  ],
  needsReview: false,
  reviewMessage: null,
};

describe("normalizeAnalysisPayload", () => {
  it("normalizes indices phraseGroups and passes Zod with Таяла stem casing", () => {
    const normalized = normalizeAnalysisPayload(openAiPayload) as {
      phraseGroups: Array<{
        label: string;
        startPosition: number;
        endPosition: number;
      }>;
    };

    expect(normalized.phraseGroups[0]).toMatchObject({
      label: "Таяла зима",
      startPosition: 0,
      endPosition: 1,
    });

    expect(() => parseSentenceAnalysisOutput(normalized)).not.toThrow();
  });

  it("reconciles lemma stem городок → городк for городке", () => {
    const payload = {
      ...openAiPayload,
      words: openAiPayload.words.map((w) =>
        w.original === "городке" ? { ...w, stem: "городок", ending: "е" } : w,
      ),
    };
    const normalized = normalizeAnalysisPayload(payload);
    expect(() => parseSentenceAnalysisOutput(normalized)).not.toThrow();
  });
});
