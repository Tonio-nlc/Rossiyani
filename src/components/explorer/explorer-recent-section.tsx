"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getExplorationHistory } from "@/lib/explorer/exploration-history";

export function ExplorerRecentSection() {
  const [entries, setEntries] = useState<
    Array<{ label: string; href: string; meta: string }>
  >([]);

  useEffect(() => {
    setEntries(
      getExplorationHistory().slice(0, 8).map((entry) => ({
        label: entry.label,
        href: entry.href,
        meta: entry.kind,
      })),
    );
  }, []);

  if (entries.length === 0) {
    return (
      <p className="text-metadata text-[var(--ink-muted)]">
        Vos dernières découvertes apparaîtront ici — lemmes, concepts, textes.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--hairline)]">
      {entries.map((entry) => (
        <li key={`${entry.href}-${entry.label}`}>
          <Link
            href={entry.href}
            className="focus-kb group flex items-baseline justify-between gap-4 py-3"
          >
            <span className="font-reader text-base text-[var(--ink)] group-hover:text-[var(--color-link)]">
              {entry.label}
            </span>
            <span className="text-metadata shrink-0 capitalize text-[var(--ink-muted)]">
              {entry.meta} →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
