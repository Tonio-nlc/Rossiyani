"use client";

import { useEffect, useState } from "react";

import { getExplorationHistory } from "@/lib/explorer/exploration-history";

import { ExplorerLemmaCardGrid } from "./explorer-card-grid";

export function ExplorerHubRecent() {
  const [entries, setEntries] = useState<Array<{ label: string; href: string }>>([]);

  useEffect(() => {
    const history = getExplorationHistory();
    setEntries(
      history.slice(0, 6).map((entry) => ({
        label: entry.label,
        href: entry.href,
      })),
    );
  }, []);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="explorer-explore-grid-block">
      <h2 className="explorer-explore-grid-block__title">Recent discoveries</h2>
      <ExplorerLemmaCardGrid items={entries} />
    </section>
  );
}
