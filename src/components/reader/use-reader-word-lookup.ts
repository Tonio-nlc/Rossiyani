"use client";

import { useMemo } from "react";

import {
  buildMinimalWordDetail,
  type ReaderWordSnapshot,
} from "@/lib/reader/build-minimal-word-detail";
import {
  getCachedWordDetail,
  isWordDetailEnriched,
} from "@/lib/reader/reader-word-detail-store";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type UseReaderWordLookupOptions = {
  selectedWord: ReaderWordSnapshot | null;
  cacheRevision: number;
};

type UseReaderWordLookupResult = {
  detail: WordDetailGraph | null;
  loading: boolean;
  enriched: boolean;
};

export function useReaderWordLookup({
  selectedWord,
  cacheRevision,
}: UseReaderWordLookupOptions): UseReaderWordLookupResult {
  return useMemo(() => {
    void cacheRevision;

    if (!selectedWord) {
      return { detail: null, loading: false, enriched: false };
    }

    const cached = getCachedWordDetail(selectedWord.id);
    const enriched = cached ? isWordDetailEnriched(cached) : false;

    return {
      detail: cached ?? buildMinimalWordDetail(selectedWord),
      loading: !enriched,
      enriched,
    };
  }, [selectedWord, cacheRevision]);
}
