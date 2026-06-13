import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/features/knowledge/get-lemma-knowledge", () => ({
  getLemmaKnowledge: vi.fn(),
}));
vi.mock("@/features/knowledge/get-ending-knowledge", () => ({
  getEndingKnowledge: vi.fn(),
}));
vi.mock("@/features/knowledge/get-phrase-knowledge", () => ({
  getPhraseKnowledge: vi.fn(),
}));

import { getEndingKnowledge } from "@/features/knowledge/get-ending-knowledge";
import { getLemmaKnowledge } from "@/features/knowledge/get-lemma-knowledge";
import { getPhraseKnowledge } from "@/features/knowledge/get-phrase-knowledge";
import { getWordKnowledgeWorkspace } from "@/features/knowledge/get-word-knowledge-workspace";

import { stubLemmaKnowledge } from "../helpers/lemma-knowledge-stub";

describe("getWordKnowledgeWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("merges occurrence with canonical knowledge from feature services", async () => {
    vi.mocked(getLemmaKnowledge).mockResolvedValue(
      stubLemmaKnowledge({
        lemma: "городок",
        partOfSpeech: "noun",
        occurrenceCount: 3,
        canonicalExplanation: "Petite ville — forme diminutive.",
        frenchComparison: "Le français dit « petite ville » avec deux mots.",
        forms: [
          {
            id: "f1",
            original: "городке",
            ending: "е",
            case: "prepositional",
            explanation: "prépositionnel",
            canonicalExplanation: null,
            hitCount: 3,
            occurrenceCount: 2,
          },
        ],
        concepts: [
          {
            id: "c1",
            conceptKey: "prepositional_case",
            title: "Prépositionnel case",
            canonicalExplanation: "Cas après préposition.",
            category: "GRAMMATICAL_CASE",
            frenchComparison: null,
            reviewStatus: "PENDING",
            hitCount: 1,
          },
        ],
        exampleSentences: ["Я живу в городке."],
        seenInTexts: 2,
        relatedTexts: [
          {
            textId: "t1",
            textTitle: "Hiver",
            sentenceRussian: "Я живу в городке.",
          },
        ],
      }),
    );

    vi.mocked(getEndingKnowledge).mockResolvedValue({
      ending: "е",
      caseKey: "prepositional",
      canonicalExplanation: "Terminaison prépositionnelle typique.",
      hitCount: 5,
      concepts: [],
      exampleForms: [],
    });

    vi.mocked(getPhraseKnowledge).mockResolvedValue(null);

    const workspace = await getWordKnowledgeWorkspace({
      original: "городке",
      stressMarked: "городке",
      lemma: "городок",
      partOfSpeech: "noun",
      stem: "городк",
      ending: "е",
      case: "prepositional",
      gender: "masculine",
      number: "singular",
      tense: null,
      aspect: null,
      explanation: "Dans ce texte : prépositionnel après в",
      frequency: null,
      previousWord: { original: "в", partOfSpeech: "preposition" },
      phraseOccurrence: null,
    });

    expect(workspace.canonicalExplanation).toBe("Petite ville — forme diminutive.");
    expect(workspace.contextLabel).toContain("в +");
    expect(workspace.concepts).toHaveLength(1);
    expect(workspace.relatedTexts).toHaveLength(1);
    expect(workspace.libraryHitCount).toBe(3);
  });
});
