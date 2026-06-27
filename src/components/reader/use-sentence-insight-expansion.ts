"use client";

import { useCallback, useState } from "react";

export function useSentenceInsightExpansion() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const isInsightExpanded = useCallback(
    (sentenceId: string) => expandedIds.has(sentenceId),
    [expandedIds],
  );

  const toggleInsight = useCallback((sentenceId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(sentenceId)) {
        next.delete(sentenceId);
      } else {
        next.add(sentenceId);
      }
      return next;
    });
  }, []);

  return { isInsightExpanded, toggleInsight };
}
