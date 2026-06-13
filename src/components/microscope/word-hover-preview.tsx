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
      <div className="max-w-[220px] rounded-xl border border-[var(--accent-violet)]/40 bg-[var(--surface-elevated)]/95 px-3 py-2.5 shadow-[var(--shadow-glow)] backdrop-blur-md">
        <p className="font-reader text-lg font-semibold text-[var(--foreground)]">
          {word.stressMarked}
        </p>
        <p className="mt-0.5 text-xs text-[var(--accent-violet-bright)]">{word.lemma}</p>
        {word.ending ? (
          <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
            −{word.ending}
            {word.case ? ` · ${formatCaseLabelFr(word.case)}` : ""}
          </p>
        ) : null}
        <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-[var(--muted)]">
          {word.explanation}
        </p>
      </div>
    </div>
  );
}
