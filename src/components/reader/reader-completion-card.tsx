"use client";

import Link from "next/link";

import { conceptPath } from "@/components/explorer/explorer-routes";
import { practicePath } from "@/lib/practice/constants";

type ReaderCompletionCardProps = {
  newWordsCount: number;
  constructionCount: number;
  grammarObservationCount: number;
  practiceStructure: string;
  primaryConceptKey: string | null;
};

export function ReaderCompletionCard({
  newWordsCount,
  constructionCount,
  grammarObservationCount,
  practiceStructure,
  primaryConceptKey,
}: ReaderCompletionCardProps) {
  const explorerHref = primaryConceptKey
    ? conceptPath(primaryConceptKey)
    : `/explorer?q=${encodeURIComponent(practiceStructure)}`;

  return (
    <section className="max-w-[70ch] space-y-5 border-t border-[var(--hairline)] pt-8">
      <p className="text-sm text-[var(--ink-secondary)]">
        <span aria-hidden>✓ </span>
        Reading completed
      </p>

      <div>
        <p className="home-section-label">Today you discovered</p>
        <ul className="mt-2 space-y-1 text-sm text-[var(--ink-secondary)]">
          <li>
            {newWordsCount} new word{newWordsCount === 1 ? "" : "s"}
          </li>
          {constructionCount > 0 ? (
            <li>
              {constructionCount} useful construction{constructionCount === 1 ? "" : "s"}
            </li>
          ) : null}
          {grammarObservationCount > 0 ? (
            <li>
              {grammarObservationCount} grammar observation
              {grammarObservationCount === 1 ? "" : "s"}
            </li>
          ) : null}
        </ul>
      </div>

      <div>
        <p className="text-xs text-[var(--ink-muted)]">Continue learning</p>
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
              Explore similar texts →
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
