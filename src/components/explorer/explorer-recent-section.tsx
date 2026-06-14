"use client";

import { useEffect, useState } from "react";

import { getExplorationHistory } from "@/lib/explorer/exploration-history";

import { ExplorerDiscoveryGrid } from "./explorer-discovery-grid";

export function ExplorerRecentSection() {
  const [entries, setEntries] = useState<Array<{ label: string; href: string }>>([]);

  useEffect(() => {
    const history = getExplorationHistory();
    const lemmas = history.filter((entry) => entry.kind === "lemma");
    const source = lemmas.length > 0 ? lemmas : history;

    setEntries(
      source.slice(0, 6).map((entry) => ({
        label: entry.label,
        href: entry.href,
      })),
    );
  }, []);

  if (entries.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
        Your recently viewed words will appear here as you explore.
      </p>
    );
  }

  return <ExplorerDiscoveryGrid items={entries} />;
}
