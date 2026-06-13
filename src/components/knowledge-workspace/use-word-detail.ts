"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { WordDetailGraph, WordDetailSection } from "@/types/word-detail-graph";
import {
  WORD_DETAIL_BASIC_SECTION,
  WORD_DETAIL_ENRICHMENT_SECTIONS,
} from "@/types/word-detail-graph";

type UseWordDetailResult = {
  detail: WordDetailGraph | null;
  loading: boolean;
  loadingSections: WordDetailSection[];
  error: string | null;
};

function mergeDetail(
  current: WordDetailGraph | null,
  incoming: WordDetailGraph,
): WordDetailGraph {
  if (!current) {
    return incoming;
  }

  return {
    ...current,
    ...incoming,
    domain: { ...current.domain, ...incoming.domain },
    concepts: incoming.concepts.length > 0 ? incoming.concepts : current.concepts,
    examples: incoming.examples.length > 0 ? incoming.examples : current.examples,
    relatedTexts:
      incoming.relatedTexts.length > 0 ? incoming.relatedTexts : current.relatedTexts,
    statistics: {
      ...current.statistics,
      ...incoming.statistics,
    },
    lemmaKnowledge: incoming.lemmaKnowledge ?? current.lemmaKnowledge,
    endingKnowledge: incoming.endingKnowledge ?? current.endingKnowledge,
    phraseKnowledge: incoming.phraseKnowledge ?? current.phraseKnowledge,
    loadedSections: [
      ...new Set([...current.loadedSections, ...incoming.loadedSections]),
    ],
  };
}

async function fetchWordDetail(
  wordId: string,
  sections: WordDetailSection[],
  signal: AbortSignal,
): Promise<WordDetailGraph> {
  const res = await fetch(
    `/api/words/${wordId}?sections=${sections.join(",")}`,
    { signal },
  );
  if (!res.ok) {
    throw new Error("Impossible de charger le mot");
  }
  const data = (await res.json()) as { detail: WordDetailGraph };
  return data.detail;
}

/**
 * Progressive word detail loading — basic info first, then graph enrichment.
 * No business logic: pure projection of GET /api/words/[id].
 */
export function useWordDetail(wordId: string | null): UseWordDetailResult {
  const [detail, setDetail] = useState<WordDetailGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSections, setLoadingSections] = useState<WordDetailSection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const activeWordId = useRef<string | null>(null);

  const loadEnrichment = useCallback(async (id: string, signal: AbortSignal) => {
    setLoadingSections(WORD_DETAIL_ENRICHMENT_SECTIONS);
    try {
      const enriched = await fetchWordDetail(id, WORD_DETAIL_ENRICHMENT_SECTIONS, signal);
      if (!signal.aborted && activeWordId.current === id) {
        setDetail((current) => mergeDetail(current, enriched));
      }
    } catch (err: unknown) {
      if (!signal.aborted && activeWordId.current === id) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      }
    } finally {
      if (!signal.aborted && activeWordId.current === id) {
        setLoadingSections([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!wordId) {
      activeWordId.current = null;
      setDetail(null);
      setError(null);
      setLoading(false);
      setLoadingSections([]);
      return;
    }

    activeWordId.current = wordId;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setDetail(null);
    setLoadingSections([WORD_DETAIL_BASIC_SECTION]);

    void fetchWordDetail(wordId, [WORD_DETAIL_BASIC_SECTION], controller.signal)
      .then((basic) => {
        if (controller.signal.aborted || activeWordId.current !== wordId) {
          return;
        }
        setDetail(basic);
        setLoading(false);
        setLoadingSections([]);
        void loadEnrichment(wordId, controller.signal);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || activeWordId.current !== wordId) {
          return;
        }
        setDetail(null);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        setLoading(false);
        setLoadingSections([]);
      });

    return () => controller.abort();
  }, [wordId, loadEnrichment]);

  return { detail, loading, loadingSections, error };
}
