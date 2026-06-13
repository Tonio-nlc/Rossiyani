import { prisma } from "@/lib/prisma";

export type ReaderTextData = {
  id: string;
  title: string;
  level: string;
  source: string | null;
  sentences: Array<{
    id: string;
    position: number;
    russianText: string;
    literalTranslation: string;
    naturalTranslation: string;
    difficultyScore: number;
    needsReview: boolean;
    words: Array<{
      id: string;
      position: number;
      original: string;
      stressMarked: string;
      stem: string;
      ending: string;
      partOfSpeech: string;
      case: string | null;
      explanation: string;
      lemma: string;
      gender: string | null;
      number: string | null;
      tense: string | null;
      aspect: string | null;
      frequency: string | null;
      frequencyTier: string | null;
      formId: string | null;
    }>;
    phraseGroups: Array<{
      id: string;
      type: string;
      label: string;
      explanation: string;
      startPosition: number;
      endPosition: number;
    }>;
  }>;
};

export async function getTextForReader(textId: string): Promise<ReaderTextData | null> {
  const text = await prisma.text.findUnique({
    where: { id: textId },
    include: {
      sentences: {
        orderBy: { position: "asc" },
        include: {
          words: { orderBy: { position: "asc" } },
          phraseGroups: { orderBy: { startPosition: "asc" } },
        },
      },
    },
  });

  if (!text) {
    return null;
  }

  return {
    id: text.id,
    title: text.title,
    level: text.level,
    source: text.source,
    sentences: text.sentences.map((s) => ({
      id: s.id,
      position: s.position,
      russianText: s.russianText,
      literalTranslation: s.literalTranslation,
      naturalTranslation: s.naturalTranslation,
      difficultyScore: s.difficultyScore,
      needsReview: s.needsReview,
      words: s.words.map((w) => ({
        id: w.id,
        position: w.position,
        original: w.original,
        stressMarked: w.stressMarked,
        stem: w.stem,
        ending: w.ending,
        partOfSpeech: w.partOfSpeech,
        case: w.case,
        explanation: w.explanation,
        lemma: w.lemma,
        gender: w.gender,
        number: w.number,
        tense: w.tense,
        aspect: w.aspect,
        frequency: w.frequency,
        frequencyTier: w.frequencyTier,
        formId: w.formId,
      })),
      phraseGroups: s.phraseGroups.map((g) => ({
        id: g.id,
        type: g.type,
        label: g.label,
        explanation: g.explanation,
        startPosition: g.startPosition,
        endPosition: g.endPosition,
      })),
    })),
  };
}
