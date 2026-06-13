/**
 * Russian sentence boundary detection (rule-based V1) + intelligent chunking.
 */

import { chunkSegments } from "./chunk-segments";
import { detectLyricsMode, segmentLyricsLines } from "./detect-lyrics-mode";

const SENTENCE_END = /([.!?…]+["»”']?)(\s+|$)/g;

export function segmentSentences(text: string): string[] {
  const normalized = text.trim();
  if (!normalized) {
    return [];
  }

  let baseSegments: string[];

  if (detectLyricsMode(normalized)) {
    baseSegments = segmentLyricsLines(normalized);
  } else {
    baseSegments = segmentProse(normalized);
  }

  return chunkSegments(baseSegments);
}

function segmentProse(text: string): string[] {
  const paragraphs = text.split(/\n\n+/);
  const sentences: string[] = [];

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      continue;
    }
    if (!/[.!?…]/.test(trimmed) && trimmed.includes("\n")) {
      sentences.push(...segmentLyricsLines(trimmed));
      continue;
    }
    sentences.push(...splitParagraph(trimmed));
  }

  return sentences.filter((s) => s.length > 0);
}

function splitParagraph(paragraph: string): string[] {
  const parts: string[] = [];
  let lastIndex = 0;

  for (const match of paragraph.matchAll(SENTENCE_END)) {
    const endIndex = match.index! + match[1].length;
    const chunk = paragraph.slice(lastIndex, endIndex).trim();
    if (chunk) {
      parts.push(chunk);
    }
    lastIndex = endIndex;
  }

  const remainder = paragraph.slice(lastIndex).trim();
  if (remainder) {
    parts.push(remainder);
  }

  if (parts.length === 0) {
    return [paragraph];
  }

  return parts;
}
