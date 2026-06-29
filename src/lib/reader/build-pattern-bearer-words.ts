import type { ReaderTextData } from "@/features/texts";

/** Words that carry the sentence's primary Learning Pattern (visible in text). */
export function buildPatternBearerWordIds(text: ReaderTextData): Map<string, Set<string>> {
  const bySentence = new Map<string, Set<string>>();

  for (const sentence of text.sentences) {
    const context = text.patternSlice.bySentenceId[sentence.id];
    const instance = context?.instance;
    if (!instance) {
      continue;
    }

    const ids = new Set<string>();
    const triggering = new Set(instance.triggeringTokens);

    for (const word of sentence.words) {
      if (triggering.has(word.position)) {
        ids.add(word.id);
        continue;
      }
      if (
        word.position >= instance.span.startPosition &&
        word.position <= instance.span.endPosition &&
        ids.size === 0
      ) {
        ids.add(word.id);
      }
    }

    if (ids.size > 0) {
      bySentence.set(sentence.id, ids);
    }
  }

  return bySentence;
}

export function isPatternBearerWord(
  patternBearerBySentence: Map<string, Set<string>>,
  sentenceId: string,
  wordId: string,
): boolean {
  return patternBearerBySentence.get(sentenceId)?.has(wordId) ?? false;
}
