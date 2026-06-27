import type { PhraseGroup, Sentence, Word } from "@prisma/client";

import { parseCulturalNotes, parseSyntaxAnalysis } from "@/domain/mappers";
import { resolveWordLexicalMetadata } from "@/lib/linguistics/lexical-metadata";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";

type SentenceWithRelations = Sentence & {
  words: Word[];
  phraseGroups: PhraseGroup[];
};

/**
 * Rebuilds a SentenceAnalysisOutput from persisted Text/Sentence rows — no AI.
 */
export function reconstructAnalysisFromSentence(
  sentence: SentenceWithRelations,
): SentenceAnalysisOutput {
  const sortedWords = [...sentence.words].sort((a, b) => a.position - b.position);

  if (sentence.analysisJson) {
    try {
      return JSON.parse(sentence.analysisJson) as SentenceAnalysisOutput;
    } catch {
      // fall through to field reconstruction
    }
  }

  return {
    russianText: sentence.russianText,
    literalTranslation: sentence.literalTranslation,
    naturalTranslation: sentence.naturalTranslation,
    russianLogic: sentence.russianLogic,
    orderExplanation: sentence.orderExplanation,
    nativeUsageNotes: sentence.nativeUsageNotes,
    register: sentence.register,
    difficultyScore: sentence.difficultyScore as SentenceAnalysisOutput["difficultyScore"],
    needsReview: sentence.needsReview,
    reviewMessage: sentence.reviewMessage,
    analysisStatus: sortedWords.length > 0 ? "complete" : "partial",
    syntaxAnalysis: parseSyntaxAnalysis(sentence.syntaxAnalysisJson) ?? undefined,
    culturalNotes: parseCulturalNotes(sentence.culturalNotesJson),
    words: sortedWords.map((word) => {
      const lexical = resolveWordLexicalMetadata({
        partOfSpeech: word.partOfSpeech,
        isProperNoun: word.isProperNoun,
        lexicalType: word.lexicalType,
      });
      return {
        position: word.position,
        original: word.original,
        lemma: word.lemma,
        stressMarked: word.stressMarked,
        stem: word.stem,
        ending: word.ending,
        partOfSpeech: word.partOfSpeech,
        isProperNoun: lexical.isProperNoun,
        lexicalType: lexical.lexicalType,
        case: word.case,
      gender: word.gender,
      number: word.number,
      tense: word.tense,
      aspect: word.aspect,
      explanation: word.explanation,
      frequency: word.frequency,
      frequencyTier: word.frequencyTier,
      translationCanonical: word.translationCanonical ?? undefined,
      translationAlternatives: parseTranslationAlternatives(word.translationAlternatives),
      };
    }),
    phraseGroups: sentence.phraseGroups.map((group) => ({
      type: group.type,
      label: group.label,
      explanation: group.explanation,
      startPosition: group.startPosition,
      endPosition: group.endPosition,
    })),
  };
}

function parseTranslationAlternatives(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const items = value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());
  return items.length > 0 ? items : undefined;
}
