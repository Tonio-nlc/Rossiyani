"use client";

import { useMemo } from "react";

import {
  buildMinimalWordDetail,
  type ReaderWordSnapshot,
} from "@/lib/reader/build-minimal-word-detail";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type UseReaderWordLookupResult = {
  detail: WordDetailGraph | null;
};

export function useReaderWordLookup(
  selectedWord: ReaderWordSnapshot | null,
  cache: Record<string, WordDetailGraph>,
): UseReaderWordLookupResult {
  return useMemo(() => {
    if (!selectedWord) {
      return { detail: null };
    }

    const cached = cache[selectedWord.id];
    if (cached) {
      return { detail: cached };
    }

    return { detail: buildMinimalWordDetail(selectedWord) };
  }, [selectedWord, cache]);
}
