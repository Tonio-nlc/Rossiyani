/**
 * @deprecated Use `@/lib/phrase-mining` — kept for backward-compatible imports.
 */
import {
  deleteSavedSentence,
  getSavedSentenceById,
  getSavedSentences,
  isSavedSentence,
  saveSentence,
} from "@/lib/phrase-mining/saved-sentence-storage";
import type { SavedSentence } from "@/types/saved-sentence";

export type SavedReaderSentence = SavedSentence;

type LegacySaveInput = {
  russianText: string;
  textId: string;
  textTitle: string;
  translation?: string;
  collection?: string;
};

export function getSavedReaderSentences(): SavedSentence[] {
  return getSavedSentences();
}

export function saveReaderSentence(sentence: LegacySaveInput): SavedSentence {
  return saveSentence({
    text: sentence.russianText,
    translation: sentence.translation ?? "",
    sourceTextId: sentence.textId,
    sourceTextTitle: sentence.textTitle,
    collection: sentence.collection ?? "",
  });
}

export function deleteReaderSentence(id: string): void {
  deleteSavedSentence(id);
}

export { getSavedSentenceById, isSavedSentence };
