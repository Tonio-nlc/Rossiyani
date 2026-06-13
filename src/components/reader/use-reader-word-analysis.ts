"use client";

import { useMemo } from "react";

import { useWordDetail } from "@/components/knowledge-workspace";
import {
  buildMinimalWordDetail,
  isWordAnalysisComplete,
  type ReaderWordSnapshot,
} from "@/lib/reader/build-minimal-word-detail";
import type { WordDetailGraph, WordDetailSection } from "@/types/word-detail-graph";

type UseReaderWordAnalysisResult = {
  detail: WordDetailGraph | null;
  loading: boolean;
  loadingSections: WordDetailSection[];
  error: string | null;
  analysisComplete: boolean;
};

export function useReaderWordAnalysis(
  selectedWord: ReaderWordSnapshot | null,
): UseReaderWordAnalysisResult {
  const localDetail = useMemo(
    () => (selectedWord ? buildMinimalWordDetail(selectedWord) : null),
    [selectedWord],
  );

  const fetchableWordId =
    selectedWord?.id.startsWith("orphan:") ? null : (selectedWord?.id ?? null);

  const remote = useWordDetail(fetchableWordId);

  const detail = remote.detail ?? localDetail;
  const analysisComplete = remote.detail
    ? isWordAnalysisComplete(remote.detail)
    : false;

  return {
    detail,
    loading: remote.loading && !localDetail,
    loadingSections: remote.loadingSections,
    error: detail ? null : remote.error,
    analysisComplete,
  };
}
