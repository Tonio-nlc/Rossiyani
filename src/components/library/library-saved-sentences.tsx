"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Reference } from "@/components/editorial";
import { practicePath } from "@/lib/practice/constants";
import {
  deleteReaderSentence,
  getSavedReaderSentences,
} from "@/lib/practice/saved-sentences";

export function LibrarySavedSentences() {
  const [sentences, setSentences] = useState(() => getSavedReaderSentences());

  useEffect(() => {
    setSentences(getSavedReaderSentences());
  }, []);

  if (sentences.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        Saved sentences from Reader will appear here.{" "}
        <Reference href="/reader">Open Reader →</Reference>
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--hairline)]">
      {sentences.map((sentence) => (
        <li key={sentence.id} className="py-5">
          <p className="font-reader text-base text-[var(--ink)]">{sentence.russianText}</p>
          <p className="mt-1 text-metadata text-[var(--ink-muted)]">
            {sentence.textTitle} ·{" "}
            {new Date(sentence.savedAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
            })}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <Reference href={`/texts/${sentence.textId}`}>Open in Reader</Reference>
            <Link
              href={practicePath({
                reference: sentence.russianText,
                context: `From: ${sentence.textTitle}`,
                textId: sentence.textId,
                textTitle: sentence.textTitle,
                from: "reader",
              })}
              className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            >
              Practice
            </Link>
            <button
              type="button"
              onClick={() => {
                deleteReaderSentence(sentence.id);
                setSentences(getSavedReaderSentences());
              }}
              className="focus-kb text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
