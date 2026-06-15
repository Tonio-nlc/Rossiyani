const SENTENCE_SPLIT = /(?<=[.!?…]["»"']?)\s+/;

const MAX_PARAGRAPH_CHARS = 380;
const MAX_PARAGRAPH_LINES = 6;

/**
 * Splits oversized paragraphs on sentence boundaries for editorial readability.
 */
export function splitLongParagraphs(text: string): string {
  const paragraphs = text.split(/\n\n+/);
  const result: string[] = [];

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      continue;
    }

    const lineCount = trimmed.split("\n").length;
    if (trimmed.length <= MAX_PARAGRAPH_CHARS && lineCount <= MAX_PARAGRAPH_LINES) {
      result.push(trimmed);
      continue;
    }

    const sentences = trimmed.split(SENTENCE_SPLIT).filter(Boolean);
    if (sentences.length <= 1) {
      result.push(trimmed);
      continue;
    }

    let chunk = "";
    let chunkLines = 0;

    for (const sentence of sentences) {
      const next = chunk ? `${chunk} ${sentence.trim()}` : sentence.trim();
      const nextLines = Math.ceil(next.length / 65);

      if (
        chunk &&
        (next.length > MAX_PARAGRAPH_CHARS || chunkLines + nextLines > MAX_PARAGRAPH_LINES)
      ) {
        result.push(chunk.trim());
        chunk = sentence.trim();
        chunkLines = Math.ceil(chunk.length / 65);
        continue;
      }

      chunk = next;
      chunkLines = nextLines;
    }

    if (chunk.trim()) {
      result.push(chunk.trim());
    }
  }

  return result.join("\n\n");
}
