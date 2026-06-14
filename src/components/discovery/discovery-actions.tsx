"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { TodaysDiscovery } from "@/features/discovery";
import {
  isDiscoverySaved,
  recordDiscoveryArchive,
  saveDiscovery,
} from "@/lib/discovery/saved-discoveries";
import { persistDailyDiscoveryCookie } from "@/lib/discovery/persist-daily-discovery-cookie";

type DiscoveryActionsProps = {
  discovery: TodaysDiscovery;
};

export function DiscoveryActions({ discovery }: DiscoveryActionsProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isDiscoverySaved(discovery.id));
    recordDiscoveryArchive(discovery);
    persistDailyDiscoveryCookie(discovery);
  }, [discovery]);

  return (
    <ul className="mt-5 flex flex-wrap gap-6 text-sm font-medium tracking-wide">
      <li>
        <Link
          href={discovery.explorerHref}
          className="focus-kb text-[var(--ink)] underline-offset-4 transition hover:text-[var(--color-link)]"
        >
          Explore →
        </Link>
      </li>
      <li>
        <Link
          href={discovery.practiceHref}
          className="focus-kb text-[var(--ink)] underline-offset-4 transition hover:text-[var(--color-link)]"
        >
          Practice →
        </Link>
      </li>
      <li>
        <Link
          href={discovery.readExamplesHref}
          className="focus-kb text-[var(--ink)] underline-offset-4 transition hover:text-[var(--color-link)]"
        >
          Read examples →
        </Link>
      </li>
      <li>
        <button
          type="button"
          onClick={() => {
            saveDiscovery(discovery);
            setSaved(true);
          }}
          className="focus-kb text-[var(--ink)] underline-offset-4 transition hover:text-[var(--color-link)]"
        >
          {saved ? "Saved ✓" : "Save →"}
        </button>
      </li>
    </ul>
  );
}
