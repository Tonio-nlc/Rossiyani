"use client";

import { useEffect, useState } from "react";

import type { WordKnowledgeWorkspaceInput } from "@/types/knowledge-workspace";
import type { WordKnowledgeWorkspace } from "@/types/knowledge-workspace";

type UseKnowledgeWorkspaceResult = {
  workspace: WordKnowledgeWorkspace | null;
  loading: boolean;
  error: string | null;
};

export function useKnowledgeWorkspace(
  input: WordKnowledgeWorkspaceInput | null,
): UseKnowledgeWorkspaceResult {
  const [workspace, setWorkspace] = useState<WordKnowledgeWorkspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input) {
      setWorkspace(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void fetch("/api/knowledge/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Impossible de charger le workspace linguistique");
        }
        const data = (await res.json()) as { workspace: WordKnowledgeWorkspace };
        setWorkspace(data.workspace);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setWorkspace(null);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [input]);

  return { workspace, loading, error };
}
