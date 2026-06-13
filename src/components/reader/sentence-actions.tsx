"use client";

import Link from "next/link";
import { useState } from "react";

import { Reference } from "@/components/editorial";
import { practicePath } from "@/lib/practice/constants";
import { saveReaderSentence } from "@/lib/practice/saved-sentences";

type SentenceActionsProps = {
  sentenceRussian: string;
  textId: string;
  textTitle: string;
  selected: boolean;
};

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
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
      <Reference href={`/explorer?q=${encodeURIComponent(sentenceRussian)}`}>Explore</Reference>
      <Reference href={practiceHref}>Practice</Reference>
      <button
        type="button"
        onClick={() => {
          saveReaderSentence({ russianText: sentenceRussian, textId, textTitle });
          setSaved(true);
        }}
        className="focus-kb text-[var(--ink-secondary)] hover:text-[var(--ink)]"
      >
        {saved ? "Saved ✓" : "Save"}
      </button>
      <Link
        href={practiceHref}
        className="sr-only"
        aria-hidden
      >
        Practice this sentence
      </Link>
    </div>
  );
}
