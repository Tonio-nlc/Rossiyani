import { describe, expect, it, vi, beforeEach } from "vitest";

import type { MergeOccurrenceInput } from "@/types/knowledge-graph";

const prismaMock = {
  knowledgeForm: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  knowledgeOccurrence: {
    findUnique: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
  knowledgeLemma: {
    update: vi.fn(),
  },
  knowledgePhrase: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  knowledgePhraseOccurrence: {
    findUnique: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/services/knowledge-graph/concept-resolver", () => ({
  resolveConceptsFromAnalysis: vi.fn().mockResolvedValue(2),
  sentenceKeyForMerge: vi.fn().mockReturnValue("я живу в городке."),
}));

describe("mergeOccurrence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates occurrence and increments counts for new sentence", async () => {
    const { mergeOccurrence } = await import("@/services/knowledge-graph/merge-occurrence");

    prismaMock.knowledgeForm.findUnique.mockResolvedValue({
      id: "form-1",
      lemmaId: "lemma-1",
    });
    prismaMock.knowledgeOccurrence.findUnique.mockResolvedValue(null);
    prismaMock.knowledgeOccurrence.count.mockResolvedValue(1);
    prismaMock.knowledgePhrase.findUnique.mockResolvedValue(null);

    const input: MergeOccurrenceInput = {
      textId: "text-1",
      textTitle: "Test",
      sentenceId: "sent-1",
      words: [{ id: "w-1", position: 0, original: "городке" }],
      analysis: {
        russianText: "Я живу в городке.",
        literalTranslation: "",
        naturalTranslation: "Je vis dans la petite ville.",
        russianLogic: "",
        orderExplanation: "",
        nativeUsageNotes: "",
        register: "neutral",
        difficultyScore: 2,
        needsReview: false,
        analysisStatus: "complete",
        culturalNotes: [],
        words: [
          {
            position: 0,
            original: "городке",
            lemma: "городок",
            stressMarked: "городке",
            stem: "городк",
            ending: "е",
            partOfSpeech: "noun",
            case: "prepositional",
            explanation: "prépositionnel",
          },
        ],
        phraseGroups: [],
      },
    };

    const result = await mergeOccurrence(input);

    expect(result.occurrencesCreated).toBe(1);
    expect(result.occurrencesSkipped).toBe(0);
    expect(prismaMock.knowledgeOccurrence.create).toHaveBeenCalledOnce();
    expect(prismaMock.knowledgeForm.update).toHaveBeenCalledWith({
      where: { id: "form-1" },
      data: { occurrenceCount: { increment: 1 } },
    });
    expect(result.conceptsLinked).toBe(2);
  });

  it("skips duplicate occurrence for same sentence position", async () => {
    const { mergeOccurrence } = await import("@/services/knowledge-graph/merge-occurrence");

    prismaMock.knowledgeForm.findUnique.mockResolvedValue({
      id: "form-1",
      lemmaId: "lemma-1",
    });
    prismaMock.knowledgeOccurrence.findUnique.mockResolvedValue({ id: "occ-existing" });
    prismaMock.knowledgePhrase.findUnique.mockResolvedValue(null);

    const input: MergeOccurrenceInput = {
      textId: "text-1",
      textTitle: "Test",
      sentenceId: "sent-1",
      words: [{ id: "w-1", position: 0, original: "городке" }],
      analysis: {
        russianText: "Он работает в городке.",
        literalTranslation: "",
        naturalTranslation: "",
        russianLogic: "",
        orderExplanation: "",
        nativeUsageNotes: "",
        register: "neutral",
        difficultyScore: 2,
        needsReview: false,
        analysisStatus: "complete",
        culturalNotes: [],
        words: [
          {
            position: 0,
            original: "городке",
            lemma: "городок",
            stressMarked: "городке",
            stem: "городк",
            ending: "е",
            partOfSpeech: "noun",
            case: "prepositional",
            explanation: "prépositionnel",
          },
        ],
        phraseGroups: [],
      },
    };

    const result = await mergeOccurrence(input);

    expect(result.occurrencesCreated).toBe(0);
    expect(result.occurrencesSkipped).toBe(1);
    expect(prismaMock.knowledgeOccurrence.create).not.toHaveBeenCalled();
  });
});
