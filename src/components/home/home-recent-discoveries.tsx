"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getDateKey } from "@/features/discovery/discovery-seed";
import type { DiscoveryArchiveEntry } from "@/lib/discovery/saved-discoveries";
import { getDiscoveryArchive } from "@/lib/discovery/saved-discoveries";

export function HomeRecentDiscoveries() {
  const [items, setItems] = useState<DiscoveryArchiveEntry[]>([]);

  useEffect(() => {
    const today = getDateKey();
    const archive = getDiscoveryArchive().filter((entry) => entry.dateKey !== today);
    setItems(archive.slice(0, 8));
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <p className="home-section-label">Recent discoveries</p>

      <ul className="mt-6 flex gap-8 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((entry) => (
          <li key={entry.dateKey} className="min-w-[11rem] shrink-0">
            <Link href={entry.explorerHref} className="focus-kb group block">
              <p className="break-russian font-reader text-xl leading-tight text-[var(--ink)] transition group-hover:text-[var(--color-link)]">
                {entry.displayLabel}
              </p>
              {entry.subtitle && entry.subtitle !== "—" ? (
                <p className="mt-1 line-clamp-1 text-sm italic text-[var(--ink-secondary)]">
                  {entry.subtitle}
                </p>
              ) : null}
              <p className="mt-2 text-metadata text-[var(--ink-muted)]">{entry.typeLabel}</p>
              <p className="mt-3 text-sm text-[var(--ink-secondary)] transition group-hover:text-[var(--color-link)]">
                Open →
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
