import { getSavedSentences } from "@/lib/phrase-mining";
import { getSavedReaderWords } from "@/lib/reader/saved-words";

import { loadVocabularyExpressions } from "./load-expressions";
import type { VocabularyData, VocabularySentence, VocabularyWord } from "./types";

function mapWords(): VocabularyWord[] {
  return getSavedReaderWords().map((entry) => ({
    id: entry.id,
    russian: entry.displayForm,
    lemma: entry.lemma,
    textId: entry.textId,
    savedAt: entry.savedAt,
  }));
}

function mapSentences(): VocabularySentence[] {
  return getSavedSentences().map((sentence) => ({
    id: sentence.id,
    russian: sentence.text,
    translation: sentence.translation,
    sourceTextId: sentence.sourceTextId,
    sourceTextTitle: sentence.sourceTextTitle,
    collection: sentence.collection,
    savedAt: sentence.createdAt,
  }));
}

export function buildVocabularyData(): VocabularyData {
  const words = mapWords();
  const expressions = loadVocabularyExpressions();
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
