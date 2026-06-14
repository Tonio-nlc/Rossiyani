"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { practicePath } from "@/lib/practice/constants";
import { deleteComposePhrase, getSavedComposePhrases } from "@/lib/compose/saved-phrases";

function truncate(text: string, max = 48): string {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export function LibraryMyPhrases() {
  const [phrases, setPhrases] = useState(() => getSavedComposePhrases());

  useEffect(() => {
    setPhrases(getSavedComposePhrases());
  }, []);

  if (phrases.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-[var(--hairline)] pt-8">
      <p className="home-section-label">Saved analyses</p>
      <ul className="mt-4 divide-y divide-[var(--hairline)]">
        {phrases.map((phrase) => (
          <li key={phrase.id} className="py-5">
          <p className="break-russian font-reader text-base text-[var(--ink)]">
            {truncate(phrase.originalSentence)}
          </p>
          <p className="mt-1 text-metadata text-[var(--ink-muted)]">
            {new Date(phrase.savedAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
            })}
          </p>

          {phrase.structures.length > 0 ? (
            <div className="mt-4">
              <p className="home-section-label">Structures</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {phrase.structures.map((structure) => (
                  <li key={structure.href}>
                    <Link
                      href={structure.href}
                      className="focus-kb font-reader text-sm text-[var(--ink-secondary)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
                    >
                      {structure.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <Link
              href={practicePath({ phraseId: phrase.id })}
              className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            >
              Open analysis
            </Link>
            <Link
              href={practicePath({ text: phrase.originalSentence, context: phrase.context })}
              className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            >
              Open in Practice
            </Link>
            {phrase.structures[0] ? (
              <Link
                href={phrase.structures[0].href}
                className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]"
              >
                Explore structures
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => {
                deleteComposePhrase(phrase.id);
                setPhrases(getSavedComposePhrases());
              }}
              className="focus-kb text-[var(--ink-muted)] hover:text-[var(--ink)]"
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
