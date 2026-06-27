import type { SavedDiscovery } from "@/lib/discovery/saved-discoveries";
import type { SavedReaderWord } from "@/lib/reader/saved-words";
import { vocabularyWordPath } from "@/lib/vocabulary";
import type { SavedSentence } from "@/types/saved-sentence";

import type { ReviewCardContent, ReviewCardType } from "./types";

export function reviewSourceKey(type: ReviewCardType, id: string): string {
  return `${type}:${id}`;
}

export function buildVocabularyReviewContent(
  word: SavedReaderWord,
  enrichment?: {
    translation?: string | null;
    stressMarked?: string | null;
    partOfSpeech?: string | null;
    exampleRussian?: string | null;
    exampleTranslation?: string | null;
    wordId?: string | null;
  },
): ReviewCardContent {
  const prompt = enrichment?.stressMarked?.trim() || word.displayForm.trim();
  return {
    prompt,
    answer: enrichment?.translation?.trim() || word.lemma?.trim() || "—",
    hint: word.lemma && word.lemma !== prompt ? word.lemma : null,
    exampleRussian: enrichment?.exampleRussian ?? null,
    exampleTranslation: enrichment?.exampleTranslation ?? null,
    partOfSpeech: enrichment?.partOfSpeech ?? null,
    sourceTextId: word.textId,
    sourceTextTitle: null,
    sourceTextHref: `/texts/${word.textId}`,
    vocabularyHref: vocabularyWordPath(word.id),
    audioTarget: enrichment?.wordId
      ? { scope: "word", entityId: enrichment.wordId }
      : {
          scope: "utterance",
          text: prompt,
          cacheKey: `review-vocab:${word.id}`,
        },
  };
}

export function buildExpressionReviewContent(discovery: SavedDiscovery): ReviewCardContent {
  return {
    prompt: discovery.displayLabel,
    answer: discovery.explanation?.trim() || discovery.subtitle?.trim() || "—",
    hint: discovery.typeLabel,
    exampleRussian: discovery.exampleRussian ?? null,
    exampleTranslation: discovery.exampleTranslation ?? null,
    partOfSpeech: null,
    sourceTextId: null,
    sourceTextTitle: null,
    sourceTextHref: discovery.explorerHref,
    vocabularyHref: null,
    audioTarget: {
      scope: "utterance",
      text: discovery.displayLabel,
      cacheKey: `review-expr:${discovery.id}`,
    },
  };
}

export function buildGrammarReviewContent(sentence: SavedSentence): ReviewCardContent {
  return {
    prompt: sentence.text,
    answer: sentence.translation?.trim() || "—",
    hint: "Construction rencontrée dans vos lectures",
    exampleRussian: sentence.text,
    exampleTranslation: sentence.translation || null,
    partOfSpeech: null,
    sourceTextId: sentence.sourceTextId,
    sourceTextTitle: sentence.sourceTextTitle,
    sourceTextHref: `/texts/${sentence.sourceTextId}`,
    vocabularyHref: `/vocabulary/sentences/${sentence.id}`,
    audioTarget: {
      scope: "utterance",
      text: sentence.text,
      cacheKey: `review-grammar:${sentence.id}`,
    },
  };
}
