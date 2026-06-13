"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Reference } from "@/components/editorial";
import type { DiscoveryArchiveEntry } from "@/lib/discovery/saved-discoveries";
import {
  formatArchiveDate,
  getDiscoveryArchive,
} from "@/lib/discovery/saved-discoveries";

export function LibraryMyDiscoveries() {
  const [archive, setArchive] = useState<DiscoveryArchiveEntry[]>([]);

  useEffect(() => {
    setArchive(getDiscoveryArchive());
  }, []);

  if (archive.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        Your daily discoveries will appear here.{" "}
        <Reference href="/">Open today&apos;s discovery →</Reference>
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--hairline)]">
      {archive.map((entry) => (
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
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <Link
              href={entry.explorerHref}
              className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            >
              Explore
            </Link>
            <Link
              href={entry.practiceHref}
              className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            >
              Practice
            </Link>
            <Link
              href={entry.readExamplesHref}
              className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            >
              Read
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
