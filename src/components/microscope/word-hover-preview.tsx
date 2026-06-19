"use client";

import { formatCaseLabelFr } from "@/features/grammar";

type HoverWord = {
  stressMarked: string;
  lemma: string;
  ending: string;
  case: string | null;
  explanation: string;
};

type WordHoverPreviewProps = {
  word: HoverWord;
  anchorRect: DOMRect | null;
};

export function WordHoverPreview({ word, anchorRect }: WordHoverPreviewProps) {
  if (!anchorRect) {
    return null;
  }

  const top = anchorRect.top + window.scrollY - 8;
  const left = anchorRect.left + window.scrollX + anchorRect.width / 2;

  return (
    <div
      className="word-hover-preview pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full"
      style={{ top, left }}
      role="tooltip"
    >
      <div className="max-w-[220px] border border-[var(--hairline)] bg-[var(--paper)] px-3 py-2.5">
        <p className="font-reader text-lg font-semibold text-[var(--ink)]">{word.stressMarked}</p>
        <p className="mt-0.5 text-xs text-[var(--color-primary)]">{word.lemma}</p>
        {word.ending ? (
          <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--ink-muted)]">
            −{word.ending}
            {word.case ? ` · ${formatCaseLabelFr(word.case)}` : ""}
          </p>
        ) : null}
        <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-[var(--ink-muted)]">
          {word.explanation}
        </p>
      </div>
    </div>
  );
}
