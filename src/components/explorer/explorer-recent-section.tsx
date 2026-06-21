"use client";

import { useEffect, useState } from "react";

import { getExplorationHistory } from "@/lib/explorer/exploration-history";

import { ExplorerCompactList } from "./explorer-compact-list";

const RECENT_LIMIT = 6;

export function ExplorerRecentSection() {
  const [entries, setEntries] = useState<Array<{ label: string; href: string }>>([]);

  useEffect(() => {
    const history = getExplorationHistory();
    const lemmas = history.filter((entry) => entry.kind === "lemma");
    const source = lemmas.length > 0 ? lemmas : history;

    setEntries(
      source.slice(0, RECENT_LIMIT).map((entry) => ({
        label: entry.label,
        href: entry.href,
      })),
    );
  }, []);

  return <ExplorerCompactList title="Récent" items={entries} />;
}
