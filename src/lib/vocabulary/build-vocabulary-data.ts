import { getSavedSentences } from "@/lib/phrase-mining";
import { practicePath } from "@/lib/practice/constants";
import { getSavedReaderWords } from "@/lib/reader/saved-words";

import {
  createBadge,
  vocabularySentencePath,
  vocabularyWordPath,
} from "./card-utils";
import { loadVocabularyExpressions } from "./load-expressions";
import type {
  VocabularyData,
  VocabularyExpression,
  VocabularySentence,
  VocabularyWord,
} from "./types";

function mapWords(): VocabularyWord[] {
  return getSavedReaderWords().map((entry) => ({
    id: entry.id,
    russian: entry.displayForm,
    headword: entry.lemma,
    textId: entry.textId,
    savedAt: entry.savedAt,
    detailHref: vocabularyWordPath(entry.id),
    sourceTextHref: `/texts/${entry.textId}`,
    translation: null,
    partOfSpeech: null,
    cefrLevel: null,
    stressMarked: null,
    lastSeenAt: entry.savedAt,
    textCount: 1,
    exampleRussian: null,
    exampleTranslation: null,
    badges: [createBadge("saved", "Enregistré", "blue")],
  }));
}

function mapExpressions(): VocabularyExpression[] {
  return loadVocabularyExpressions();
}

function mapSentences(): VocabularySentence[] {
  return getSavedSentences().map((sentence) => {
    const badges = [
      createBadge("type-sentence", "Phrase", "green"),
      ...(sentence.collection
        ? [createBadge(`collection-${sentence.collection}`, sentence.collection, "teal")]
        : []),
    ];

    return {
      id: sentence.id,
      russian: sentence.text,
      translation: sentence.translation,
      sourceTextId: sentence.sourceTextId,
      sourceTextTitle: sentence.sourceTextTitle,
      collection: sentence.collection,
      savedAt: sentence.createdAt,
      detailHref: vocabularySentencePath(sentence.id),
      practiceHref: practicePath({
        savedSentenceId: sentence.id,
        text: sentence.text,
        reference: sentence.text,
        context: `From: ${sentence.sourceTextTitle}`,
        textId: sentence.sourceTextId,
        textTitle: sentence.sourceTextTitle,
        from: "reader",
      }),
      badges,
    };
  });
}

export function buildVocabularyData(): VocabularyData {
  const words = mapWords();
  const expressions = mapExpressions();
  const sentences = mapSentences();

  return {
    words,
    expressions,
    sentences,
    stats: {
      words: words.length,
      expressions: expressions.length,
      sentences: sentences.length,
    },
  };
}

export function mergeWordEnrichment(
  words: VocabularyWord[],
  enrichment: import("./types").VocabularyWordEnrichment[],
): VocabularyWord[] {
  const byId = new Map(enrichment.map((item) => [item.id, item]));

  return words.map((word) => {
    const extra = byId.get(word.id);
    if (!extra) {
      return word;
    }

    const mergedBadges = [...extra.badges];
    if (mergedBadges.length === 0) {
      mergedBadges.push(createBadge("saved", "Enregistré", "blue"));
    }

    return {
      ...word,
      translation: extra.translation,
      partOfSpeech: extra.partOfSpeech,
      cefrLevel: extra.cefrLevel,
      stressMarked: extra.stressMarked,
      textCount: extra.textCount,
      exampleRussian: extra.exampleRussian,
      exampleTranslation: extra.exampleTranslation,
      badges: mergedBadges,
    };
  });
}
