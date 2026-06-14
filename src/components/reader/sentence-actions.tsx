"use client";

import Link from "next/link";
import { useState } from "react";

import { practicePath } from "@/lib/practice/constants";
import { saveReaderSentence } from "@/lib/practice/saved-sentences";

type SentenceActionsProps = {
  sentenceRussian: string;
  textId: string;
  textTitle: string;
  selected: boolean;
};

const linkClass =
  "focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline";

export function SentenceActions({
  sentenceRussian,
  textId,
  textTitle,
  selected,
}: SentenceActionsProps) {
  const [saved, setSaved] = useState(false);

  if (!selected) {
    return null;
  }

  const practiceHref = practicePath({
    reference: sentenceRussian,
    context: `From: ${textTitle}`,
    textId,
    textTitle,
    from: "reader",
    structure: sentenceRussian.split(/\s+/).slice(0, 3).join(" "),
  });

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
      <Link href={`/explorer?q=${encodeURIComponent(sentenceRussian)}`} className={linkClass}>
        Explore
      </Link>
      <Link href={practiceHref} className={linkClass}>
        Practice
      </Link>
      <button
        type="button"
        onClick={() => {
          saveReaderSentence({ russianText: sentenceRussian, textId, textTitle });
          setSaved(true);
        }}
        className={linkClass}
      >
        {saved ? "✓ Saved" : "Save"}
      </button>
    </div>
  );
}
