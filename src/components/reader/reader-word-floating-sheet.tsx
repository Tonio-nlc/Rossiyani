"use client";

import type { ReactNode } from "react";

type ReaderWordFloatingSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function ReaderWordFloatingSheet({
  open,
  onClose,
  children,
}: ReaderWordFloatingSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Fermer la fiche mot"
        className="reader-word-sheet-backdrop fixed inset-0 z-40 bg-[var(--ink)]/10 lg:bg-transparent"
        onClick={onClose}
      />

      <aside
        className="reader-word-sheet animate-microscope-slide fixed z-50 flex max-h-[min(75vh,34rem)] w-full flex-col border border-[var(--hairline)] bg-[var(--paper)] shadow-[0_12px_40px_rgba(31,31,29,0.08)] bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-6 lg:top-[calc(var(--header-height)+1.25rem)] lg:w-[min(100%,22.5rem)] xl:right-[max(1.5rem,calc((100vw-70ch)/2-24rem))]"
        aria-label="Fiche mot"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--hairline)] px-5 py-3">
          <p className="text-xs font-medium tracking-wide text-[var(--ink-muted)]">
            Compréhension
          </p>
          <button
            type="button"
            onClick={onClose}
            className="focus-kb text-sm text-[var(--ink-secondary)] transition hover:text-[var(--ink)]"
          >
            Fermer
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </aside>
    </>
  );
}
