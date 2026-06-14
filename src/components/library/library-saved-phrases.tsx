"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Reference } from "@/components/editorial";
import {
  getSavedPhrases,
  removePhrase,
  SAVED_PHRASE_REWRITE_LABELS,
  type SavedPhrase,
} from "@/features/library";
import { practicePath } from "@/lib/practice/constants";

function formatSavedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function LibrarySavedPhrases() {
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);

  const refresh = useCallback(() => {
    setPhrases(getSavedPhrases());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (phrases.length === 0) {
    return (
      <div>
        <p className="home-section-label">Saved phrases</p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
          Save interesting rewrites from Practice to build your personal Russian library.
        </p>
        <Reference href="/practice" className="mt-4 inline-block">
          Go to Practice →
        </Reference>
      </div>
    );
  }

  return (
    <div>
      <p className="home-section-label">Saved phrases</p>
      <ul className="mt-4 space-y-3">
        {phrases.map((phrase) => (
          <li
            key={phrase.id}
            className="rounded-sm border border-[var(--hairline)] px-4 py-4 transition hover:border-[var(--hairline-strong)]"
          >
            <p className="break-russian font-reader text-[clamp(1.125rem,2.5vw,1.375rem)] leading-relaxed text-[var(--ink)]">
              {phrase.rewrittenSentence}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-[var(--hairline)] px-2.5 py-0.5 text-xs font-medium tracking-wide text-[var(--ink-secondary)]">
                {SAVED_PHRASE_REWRITE_LABELS[phrase.rewriteType]}
              </span>
              <span className="text-metadata text-[var(--ink-muted)]">
                {formatSavedDate(phrase.createdAt)}
              </span>
            </div>

            {phrase.explanation ? (
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
                {phrase.explanation}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {phrase.structures[0] ? (
                <Link
                  href={phrase.structures[0].href}
                  className="focus-kb text-[var(--ink-secondary)] transition hover:text-[var(--color-link)]"
                >
                  Explore structure →
                </Link>
              ) : null}
              <Link
                href={practicePath({ text: phrase.rewrittenSentence })}
                className="focus-kb text-[var(--ink-secondary)] transition hover:text-[var(--color-link)]"
              >
                Practice again →
              </Link>
              <button
                type="button"
                onClick={() => {
                  removePhrase(phrase.id);
                  refresh();
                }}
                className="focus-kb text-[var(--ink-muted)] transition hover:text-[var(--ink)]"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
