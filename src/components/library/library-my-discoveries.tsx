"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { GhostButton } from "@/components/design-system";
import { Reference } from "@/components/editorial";
import type { DiscoveryArchiveEntry } from "@/lib/discovery/saved-discoveries";
import {
  formatArchiveDate,
  getDiscoveryArchive,
} from "@/lib/discovery/saved-discoveries";

const DISCOVERY_LIMIT = 5;

export function LibraryMyDiscoveries() {
  const [archive, setArchive] = useState<DiscoveryArchiveEntry[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setArchive(getDiscoveryArchive());
  }, []);

  if (archive.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        Vos découvertes apparaîtront ici.{" "}
        <Reference href="/">Voir la découverte du jour →</Reference>
      </p>
    );
  }

  const visible = showAll ? archive : archive.slice(0, DISCOVERY_LIMIT);
  const hasMore = archive.length > DISCOVERY_LIMIT;

  return (
    <div>
      <ul className="divide-y divide-[var(--hairline)]">
        {visible.map((entry) => (
          <li key={entry.dateKey} className="py-5 first:pt-0">
            <p className="home-section-label">{formatArchiveDate(entry.dateKey)}</p>
            <Link
              href={entry.explorerHref}
              className="focus-kb group mt-2 block"
            >
              <p className="break-russian font-reader text-[clamp(1.25rem,3vw,1.75rem)] leading-tight text-[var(--ink)] group-hover:text-[var(--color-link)]">
                {entry.displayLabel}
              </p>
            </Link>
            {entry.subtitle && entry.subtitle !== "—" ? (
              <p className="mt-1 text-sm italic text-[var(--ink-secondary)]">
                &ldquo;{entry.subtitle}&rdquo;
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      {hasMore && !showAll ? (
        <div className="mt-4">
          <GhostButton onClick={() => setShowAll(true)}>Voir tout →</GhostButton>
        </div>
      ) : null}
    </div>
  );
}
