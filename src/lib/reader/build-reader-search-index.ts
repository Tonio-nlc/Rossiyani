import { extractLexicalTranslationFromExplanation } from "@/features/grammar/french-comparison";
import { lookupEstimatedGloss } from "@/lib/formatting/estimate-word-translation";
import { normalizeSearchText } from "@/lib/reader/normalize-search-text";
import type { ReaderTextData } from "@/features/texts";

export type ReaderSearchEntry = {
  wordId: string;
  sentenceId: string;
  original: string;
  lemma: string;
  frenchGloss: string;
  searchBlob: string;
};

function extractSearchGloss(word: {
  original: string;
  lemma: string;
  explanation: string;
}): string {
  return (
    extractLexicalTranslationFromExplanation(word.explanation) ??
    lookupEstimatedGloss(word.original) ??
    lookupEstimatedGloss(word.lemma) ??
    ""
  );
}

export function buildReaderSearchIndex(text: ReaderTextData): ReaderSearchEntry[] {
  const entries: ReaderSearchEntry[] = [];

  for (const sentence of text.sentences) {
    for (const word of sentence.words) {
      const frenchGloss = extractSearchGloss(word);
      const searchBlob = normalizeSearchText(
        [word.original, word.lemma, word.stressMarked, frenchGloss].join(" "),
      );
      entries.push({
        wordId: word.id,
        sentenceId: sentence.id,
        original: word.original,
        lemma: word.lemma,
        frenchGloss,
        searchBlob,
      });
    }
  }

  return entries;
}

export function searchReaderIndex(
  index: ReaderSearchEntry[],
  rawQuery: string,
): ReaderSearchEntry[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) {
    return [];
  }
  return index.filter((entry) => entry.searchBlob.includes(query));
}
