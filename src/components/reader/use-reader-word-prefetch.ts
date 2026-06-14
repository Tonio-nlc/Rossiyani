"use client";

import { useEffect, useMemo, useRef } from "react";

import type { ReaderTextData } from "@/features/texts";
import { isFetchableWordId } from "@/lib/reader/reader-word-detail-store";

const RECENT_WORD_LIMIT = 8;
const LOOKAHEAD_SENTENCES = 2;

function wordIdsForSentences(
  text: ReaderTextData,
  sentenceIds: Iterable<string>,
): string[] {
  const ids = new Set<string>();
  const idSet = sentenceIds instanceof Set ? sentenceIds : new Set(sentenceIds);

  for (const sentence of text.sentences) {
    if (!idSet.has(sentence.id)) {
      continue;
    }
    for (const word of sentence.words) {
      if (isFetchableWordId(word.id)) {
        ids.add(word.id);
      }
    }
  }

  return [...ids];
}

function lookaheadSentenceIds(text: ReaderTextData, anchorIds: string[]): string[] {
  if (anchorIds.length === 0) {
    return [];
  }

  const indices = anchorIds
    .map((id) => text.sentences.findIndex((sentence) => sentence.id === id))
    .filter((index) => index >= 0);

  if (indices.length === 0) {
    return [];
  }

  const start = Math.min(...indices);
  const result: string[] = [];

  for (let offset = 1; offset <= LOOKAHEAD_SENTENCES; offset += 1) {
    const sentence = text.sentences[start + offset];
    if (sentence) {
      result.push(sentence.id);
    }
  }

  return result;
}

type UseReaderWordPrefetchOptions = {
  text: ReaderTextData;
  visibleSentenceIds: string[];
  selectedWordId: string | null;
  hoveredWordId: string | null;
  prefetch: (wordIds: string[]) => void;
};

export function useReaderWordPrefetch({
  text,
  visibleSentenceIds,
  selectedWordId,
  hoveredWordId,
  prefetch,
}: UseReaderWordPrefetchOptions) {
  const recentWordIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!selectedWordId || !isFetchableWordId(selectedWordId)) {
      return;
    }
    const recent = recentWordIdsRef.current.filter((id) => id !== selectedWordId);
    recentWordIdsRef.current = [selectedWordId, ...recent].slice(0, RECENT_WORD_LIMIT);
  }, [selectedWordId]);

  const prefetchIds = useMemo(() => {
    const ids = new Set<string>();

    const visibleIds =
      visibleSentenceIds.length > 0
        ? visibleSentenceIds
        : text.sentences.slice(0, 1).map((sentence) => sentence.id);

    for (const wordId of wordIdsForSentences(text, visibleIds)) {
      ids.add(wordId);
    }

    for (const wordId of wordIdsForSentences(text, lookaheadSentenceIds(text, visibleIds))) {
      ids.add(wordId);
    }

    if (hoveredWordId && isFetchableWordId(hoveredWordId)) {
      ids.add(hoveredWordId);
    }

    if (selectedWordId && isFetchableWordId(selectedWordId)) {
      ids.add(selectedWordId);
    }

    for (const wordId of recentWordIdsRef.current) {
      ids.add(wordId);
    }

    return [...ids];
  }, [text, visibleSentenceIds, selectedWordId, hoveredWordId]);

  useEffect(() => {
    if (prefetchIds.length === 0) {
      return;
    }
    prefetch(prefetchIds);
  }, [prefetch, prefetchIds]);
}
