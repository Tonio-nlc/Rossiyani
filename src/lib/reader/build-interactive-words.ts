import type { ReaderTextData } from "@/features/texts";

export type WordHighlightKind = "pattern" | "verb" | "construction" | "grammar" | "noun";

export type InteractiveWordEntry = {
  id: string;
  lemma: string;
  display: string;
  highlightKind: WordHighlightKind;
  sentenceId: string;
};

function phraseGroupWordIds(
  phraseGroups: ReaderTextData["sentences"][number]["phraseGroups"],
): Map<number, "construction"> {
  const map = new Map<number, "construction">();
  for (const group of phraseGroups) {
    for (let position = group.startPosition; position <= group.endPosition; position += 1) {
      map.set(position, "construction");
    }
  }
  return map;
}

function classifyWord(
  word: ReaderTextData["sentences"][number]["words"][number],
  inPhraseGroup: boolean,
): WordHighlightKind | null {
  if (!word.formId) {
    return null;
  }

  if (inPhraseGroup) {
    return "construction";
  }

  if (word.partOfSpeech === "verb") {
    return "verb";
  }

  if (word.ending?.trim() || (word.case && word.case !== "nominative")) {
    return "grammar";
  }

  if (word.partOfSpeech === "adjective") {
    return "grammar";
  }

  if (word.partOfSpeech === "noun" && word.lemma.trim().length >= 4) {
    return "noun";
  }

  if (word.partOfSpeech === "adverb" && word.lemma.trim().length >= 5) {
    return "noun";
  }

  return null;
}

export function buildInteractiveWordsBySentence(
  text: ReaderTextData,
): Map<string, Map<string, WordHighlightKind>> {
  const result = new Map<string, Map<string, WordHighlightKind>>();

  for (const sentence of text.sentences) {
    const phrasePositions = phraseGroupWordIds(sentence.phraseGroups);
    const sentenceMap = new Map<string, WordHighlightKind>();

    for (const word of sentence.words) {
      const inPhraseGroup = phrasePositions.has(word.position);
      const kind = classifyWord(word, inPhraseGroup);
      if (kind) {
        sentenceMap.set(word.id, kind);
      }
    }

    result.set(sentence.id, sentenceMap);
  }

  return result;
}

/** Unique interactive words for the sidebar index, in reading order. */
export function buildTextWordIndex(
  text: ReaderTextData,
  interactiveBySentence: Map<string, Map<string, WordHighlightKind>>,
): InteractiveWordEntry[] {
  const seen = new Set<string>();
  const entries: InteractiveWordEntry[] = [];

  for (const sentence of text.sentences) {
    const interactive = interactiveBySentence.get(sentence.id);
    if (!interactive) {
      continue;
    }

    for (const word of sentence.words) {
      const kind = interactive.get(word.id);
      if (!kind) {
        continue;
      }

      const key = word.lemma.trim().toLowerCase() || word.original.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      entries.push({
        id: word.id,
        lemma: word.lemma,
        display: word.stressMarked || word.original,
        highlightKind: kind,
        sentenceId: sentence.id,
      });
    }
  }

  return entries;
}
