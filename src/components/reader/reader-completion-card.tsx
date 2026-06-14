"use client";

import Link from "next/link";

import { conceptPath } from "@/components/explorer/explorer-routes";
import { practicePath } from "@/lib/practice/constants";

type ReaderCompletionCardProps = {
  wordsReviewed: number;
  structureCount: number;
  expressionCount: number;
  practiceStructure: string;
  primaryConceptKey: string | null;
};

export function ReaderCompletionCard({
  wordsReviewed,
  structureCount,
  expressionCount,
  practiceStructure,
  primaryConceptKey,
}: ReaderCompletionCardProps) {
  const explorerHref = primaryConceptKey
    ? conceptPath(primaryConceptKey)
    : `/explorer?q=${encodeURIComponent(practiceStructure)}`;

  return (
    <section className="max-w-[70ch] space-y-4 border-t border-[var(--hairline)] pt-8">
      <p className="text-sm text-[var(--ink-secondary)]">
        <span aria-hidden>✓ </span>
        Reading completed
      </p>
      <div>
        <p className="home-section-label">Today you discovered</p>
        <ul className="mt-2 space-y-1 text-sm text-[var(--ink-secondary)]">
          <li>
            {wordsReviewed} word{wordsReviewed === 1 ? "" : "s"}
          </li>
          {structureCount > 0 ? (
            <li>
              {structureCount} structure{structureCount === 1 ? "" : "s"}
            </li>
          ) : null}
          {expressionCount > 0 ? (
            <li>
              {expressionCount} expression{expressionCount === 1 ? "" : "s"}
            </li>
          ) : null}
        </ul>
      </div>
      <div>
        <p className="text-xs text-[var(--ink-muted)]">Continue</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li>
            <Link
              href={practicePath({
                structure: practiceStructure,
                mode: "structure",
                from: "reader",
              })}
              className="focus-kb text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline"
            >
              Practice →
            </Link>
          </li>
          <li>
            <Link
              href={explorerHref}
              className="focus-kb text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline"
            >
              Explore →
            </Link>
          </li>
          <li>
            <Link
              href="/library"
              className="focus-kb text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline"
            >
              Read another text →
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
