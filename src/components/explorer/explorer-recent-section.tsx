"use client";

import { useEffect, useState } from "react";

import { GhostButton } from "@/components/design-system";
import { getExplorationHistory } from "@/lib/explorer/exploration-history";

import { ExplorerEditorialSection } from "./explorer-editorial-grid";

const RECENT_LIMIT = 4;

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

  if (entries.length === 0) {
    return null;
  }

  return (
    <ExplorerEditorialSection eyebrow="Récent">
      <ul className="flex flex-wrap gap-3">
        {entries.map((entry) => (
          <li key={`${entry.href}-${entry.label}`}>
            <GhostButton href={entry.href}>{entry.label}</GhostButton>
          </li>
        ))}
      </ul>
    </ExplorerEditorialSection>
  );
}
