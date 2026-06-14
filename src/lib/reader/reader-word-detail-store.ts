import type { WordDetailGraph } from "@/types/word-detail-graph";
import { WORD_DETAIL_SECTIONS } from "@/types/word-detail-graph";

type CacheListener = () => void;

const cache = new Map<string, WordDetailGraph>();
const pending = new Map<string, Promise<WordDetailGraph | null>>();
const listeners = new Set<CacheListener>();

let revision = 0;

const MAX_CONCURRENT = 3;
const fetchQueue: string[] = [];
const queued = new Set<string>();
let activeFetches = 0;

function notify() {
  revision += 1;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeWordDetailCache(listener: CacheListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getWordDetailCacheRevision(): number {
  return revision;
}

export function getCachedWordDetail(wordId: string): WordDetailGraph | undefined {
  return cache.get(wordId);
}

export function isWordDetailPending(wordId: string): boolean {
  return pending.has(wordId);
}

export function isWordDetailEnriched(detail: WordDetailGraph): boolean {
  return (
    detail.lemmaKnowledge !== null ||
    detail.loadedSections.some((section) => section !== "basic")
  );
}

export function isFetchableWordId(wordId: string): boolean {
  return Boolean(wordId) && !wordId.startsWith("orphan:");
}

async function requestWordDetail(wordId: string): Promise<WordDetailGraph | null> {
  const res = await fetch(`/api/words/${wordId}?sections=${WORD_DETAIL_SECTIONS.join(",")}`);
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as { detail: WordDetailGraph };
  return data.detail;
}

function drainQueue() {
  while (activeFetches < MAX_CONCURRENT && fetchQueue.length > 0) {
    const wordId = fetchQueue.shift();
    if (!wordId) {
      break;
    }
    queued.delete(wordId);

    if (cache.has(wordId) && isWordDetailEnriched(cache.get(wordId)!)) {
      continue;
    }
    if (pending.has(wordId)) {
      continue;
    }

    activeFetches += 1;
    const promise = requestWordDetail(wordId)
      .then((detail) => {
        if (detail) {
          cache.set(wordId, detail);
          notify();
        }
        return detail;
      })
      .finally(() => {
        pending.delete(wordId);
        activeFetches -= 1;
        drainQueue();
      });

    pending.set(wordId, promise);
    notify();
  }
}

/** Schedule a word fetch. No-op if cached, pending, or not fetchable. */
export function prefetchWordDetail(wordId: string): void {
  if (!isFetchableWordId(wordId)) {
    return;
  }

  const cached = cache.get(wordId);
  if (cached && isWordDetailEnriched(cached)) {
    return;
  }

  if (pending.has(wordId) || queued.has(wordId)) {
    return;
  }

  fetchQueue.push(wordId);
  queued.add(wordId);
  drainQueue();
}

export function prefetchWordDetails(wordIds: string[]): void {
  for (const wordId of wordIds) {
    prefetchWordDetail(wordId);
  }
}

/** Await a word detail — uses cache, coalesces in-flight requests. */
export async function ensureWordDetail(wordId: string): Promise<WordDetailGraph | null> {
  if (!isFetchableWordId(wordId)) {
    return null;
  }

  const cached = cache.get(wordId);
  if (cached && isWordDetailEnriched(cached)) {
    return cached;
  }

  const inFlight = pending.get(wordId);
  if (inFlight) {
    return inFlight;
  }

  prefetchWordDetail(wordId);
  return pending.get(wordId) ?? null;
}

export function clearWordDetailCache(): void {
  cache.clear();
  pending.clear();
  fetchQueue.length = 0;
  queued.clear();
  notify();
}
