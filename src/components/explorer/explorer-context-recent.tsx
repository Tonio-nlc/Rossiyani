"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getExplorationHistory } from "@/lib/explorer/exploration-history";

export function ExplorerContextRecent() {
  const [entries, setEntries] = useState<Array<{ label: string; href: string }>>([]);

  useEffect(() => {
    const history = getExplorationHistory();
    setEntries(
      history.slice(0, 5).map((entry) => ({
        label: entry.label,
        href: entry.href,
      })),
    );
  }, []);

  if (entries.length === 0) {
    return (
      <p className="explorer-context-panel__empty">
        Vos explorations récentes apparaîtront ici.
      </p>
    );
  }

  return (
    <ul className="explorer-context-panel__list">
      {entries.map((entry) => (
        <li key={`${entry.href}-${entry.label}`}>
          <Link href={entry.href} className="explorer-context-panel__link focus-kb break-russian">
            {entry.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
