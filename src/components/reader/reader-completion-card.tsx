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
        <section className="rounded-3xl border border-[var(--hairline)] bg-[var(--surface)] p-6 md:p-8">
          <p className="home-section-label">Reading completed</p>
          <p className="mt-4 font-reader text-xl text-[var(--ink)]">You reviewed:</p>
          <ul className="mt-3 space-y-1.5 text-sm text-[var(--ink-secondary)]">
            <li>{wordsReviewed} words</li>
            {structureCount > 0 ? (
              <li>{structureCount} important structures</li>
            ) : null}
            {grammarPointCount > 0 ? (
              <li>{grammarPointCount} grammar points</li>
            ) : null}
          </ul>
          <p className="mt-6 text-sm font-medium text-[var(--ink)]">Continue learning</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
            <li>
              <Link
                href={practicePath({
                  structure: practiceStructure,
                  mode: "structure",
                  from: "reader",
                })}
                className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
              >
                Practice →
              </Link>
            </li>
            {primaryConceptKey ? (
              <li>
                <Link
                  href={conceptPath(primaryConceptKey)}
                  className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
                >
                  Explore structure →
                </Link>
              </li>
            ) : null}
            <li>
              <Link
                href="/library?section=phrases"
                className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
              >
                Review saved words →
              </Link>
            </li>
          </ul>
        </section>
      ) : (
        <div className="h-8" aria-hidden />
      )}
    </div>
  );
}
