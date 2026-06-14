"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  getWordDetailCacheRevision,
  prefetchWordDetails,
  subscribeWordDetailCache,
} from "@/lib/reader/reader-word-detail-store";

export function useReaderWordDetailStore() {
  const revision = useSyncExternalStore(
    subscribeWordDetailCache,
    getWordDetailCacheRevision,
    getWordDetailCacheRevision,
  );

  const prefetch = useCallback((wordIds: string[]) => {
    prefetchWordDetails(wordIds);
  }, []);

  return { prefetch, revision };
}
