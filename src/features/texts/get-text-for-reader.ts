import { resolveTextCollectionId } from "@/content/collections";
import { normalizeCategoryIds, type CategoryId } from "@/content/categories";
import type { CollectionId } from "@/content/collections";
import { loadReaderPatternSlice } from "@/features/reader/load-reader-pattern-slice";
import { prisma } from "@/lib/prisma";
import type { ReaderPatternSlice } from "@/types/reader-pattern-experience";

export type ReaderTextData = {
  id: string;
  title: string;
  level: string;
  collectionId: CollectionId;
  categoryIds: CategoryId[];
  patternSlice: ReaderPatternSlice;
  sentences: Array<{
    id: string;
    position: number;
    russianText: string;
    literalTranslation: string;
    naturalTranslation: string;
    russianLogic: string;
    orderExplanation: string;
    nativeUsageNotes: string;
    register: string;
    difficultyScore: number;
    needsReview: boolean;
    analysisState: "PENDING" | "PROCESSING" | "READY" | "FAILED";
    words: Array<{
      id: string;
      position: number;
      original: string;
      stressMarked: string;
      stem: string;
      ending: string;
      partOfSpeech: string;
      isProperNoun: boolean | null;
      lexicalType: string | null;
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

  const patternSlice = await loadReaderPatternSlice(textId);

  return {
    id: text.id,
    title: text.title,
    level: text.level,
    collectionId: resolveTextCollectionId(text),
    categoryIds: normalizeCategoryIds(text.categoryIds),
    patternSlice,
    sentences: text.sentences.map((s) => ({
      id: s.id,
      position: s.position,
      russianText: s.russianText,
      literalTranslation: s.literalTranslation,
      naturalTranslation: s.naturalTranslation,
      russianLogic: s.russianLogic,
      orderExplanation: s.orderExplanation,
      nativeUsageNotes: s.nativeUsageNotes,
      register: s.register,
      difficultyScore: s.difficultyScore,
      needsReview: s.needsReview,
      analysisState: s.analysisState,
      words: s.words.map((w) => ({
        id: w.id,
        position: w.position,
        original: w.original,
        stressMarked: w.stressMarked,
        stem: w.stem,
        ending: w.ending,
        partOfSpeech: w.partOfSpeech,
        isProperNoun: w.isProperNoun,
        lexicalType: w.lexicalType,
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
