"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { conceptPath } from "@/components/explorer/explorer-routes";
import { practicePath } from "@/lib/practice/constants";

type ReaderCompletionCardProps = {
  wordsReviewed: number;
  structureCount: number;
  grammarPointCount: number;
  practiceStructure: string;
  primaryConceptKey: string | null;
};

export function ReaderCompletionCard({
  wordsReviewed,
  structureCount,
  grammarPointCount,
  practiceStructure,
  primaryConceptKey,
}: ReaderCompletionCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const explorerHref = primaryConceptKey
    ? conceptPath(primaryConceptKey)
    : `/explorer?q=${encodeURIComponent(practiceStructure)}`;

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="pt-4">
      {visible ? (
        <section className="border-t border-[var(--hairline)] pt-6">
          <p className="text-sm text-[var(--ink-secondary)]">
            <span aria-hidden>✓ </span>
            Reading completed
          </p>
          <p className="mt-4 home-section-label">Today you discovered</p>
          <ul className="mt-3 space-y-1 text-sm text-[var(--ink-secondary)]">
            <li>
              {wordsReviewed} new word{wordsReviewed === 1 ? "" : "s"}
            </li>
            {structureCount > 0 ? (
              <li>
                {structureCount} important structure{structureCount === 1 ? "" : "s"}
              </li>
            ) : null}
            {grammarPointCount > 0 ? (
              <li>
                {grammarPointCount} grammar observation{grammarPointCount === 1 ? "" : "s"}
              </li>
            ) : null}
          </ul>
          <div className="mt-6 border-t border-[var(--hairline)] pt-4">
            <p className="home-section-label">Continue learning</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href={practicePath({
                    structure: practiceStructure,
                    mode: "structure",
                    from: "reader",
                  })}
                  className="focus-kb text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline"
                >
                  Practice this topic →
                </Link>
              </li>
              <li>
                <Link
                  href={explorerHref}
                  className="focus-kb text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline"
                >
                  Explore these structures →
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
      ) : (
        <div className="h-8" aria-hidden />
      )}
    </div>
  );
}
