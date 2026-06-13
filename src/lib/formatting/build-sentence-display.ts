export type SentenceDisplayWord = {
  position: number;
  original: string;
};

export type SentenceDisplaySegment =
  | { type: "word"; position: number; text: string }
  | { type: "punctuation"; text: string };

const CYRILLIC_WORD_PATTERN = /[\p{Script=Cyrillic}]+(?:-[\p{Script=Cyrillic}]+)*/gu;

function appendGapSegments(
  gap: string,
  segments: SentenceDisplaySegment[],
  allocOrphanPosition: () => number,
): void {
  if (!gap) {
    return;
  }

  let lastIndex = 0;
  CYRILLIC_WORD_PATTERN.lastIndex = 0;

  for (const match of gap.matchAll(CYRILLIC_WORD_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({
        type: "punctuation",
        text: gap.slice(lastIndex, index),
      });
    }
    segments.push({
      type: "word",
      position: allocOrphanPosition(),
      text: match[0],
    });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < gap.length) {
    segments.push({
      type: "punctuation",
      text: gap.slice(lastIndex),
    });
  }
}

/**
 * Interleaves analyzed words with punctuation from russianText.
 * Punctuation is not stored as Word rows (Option B).
 * Unmatched Cyrillic in gaps becomes clickable orphan word segments.
 */
export function buildSentenceDisplay(
  russianText: string,
  words: SentenceDisplayWord[],
): SentenceDisplaySegment[] {
  const sorted = [...words].sort((a, b) => a.position - b.position);
  const segments: SentenceDisplaySegment[] = [];
  let cursor = 0;
  let orphanSeq = 0;
  const allocOrphanPosition = () => 10_000 + orphanSeq++;

  for (const word of sorted) {
    const index = russianText.indexOf(word.original, cursor);
    if (index === -1) {
      segments.push({ type: "word", position: word.position, text: word.original });
      continue;
    }

    if (index > cursor) {
      appendGapSegments(russianText.slice(cursor, index), segments, allocOrphanPosition);
    }

    segments.push({ type: "word", position: word.position, text: word.original });
    cursor = index + word.original.length;
  }

  if (cursor < russianText.length) {
    appendGapSegments(russianText.slice(cursor), segments, allocOrphanPosition);
  }

  return segments;
}
