"use client";

import { useCallback, useState } from "react";

export function useSentenceTranslationExpansion() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const isExpanded = useCallback(
    (sentenceId: string, showAll: boolean) => showAll || expandedIds.has(sentenceId),
    [expandedIds],
  );

  const toggleExpanded = useCallback((sentenceId: string) => {
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

  return { isExpanded, toggleExpanded };
}
