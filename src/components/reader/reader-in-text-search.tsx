"use client";

import type { RefObject } from "react";

type ReaderInTextSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  resultCount: number;
  activeIndex: number;
  isOpen: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function ReaderInTextSearch({
  query,
  onQueryChange,
  resultCount,
  activeIndex,
  inputRef,
  onClose,
  onNext,
  onPrevious,
}: ReaderInTextSearchProps) {
  const hasQuery = query.trim().length > 0;

  return (
    <div className="border-y border-[var(--hairline)] py-[var(--space-2)]">
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
            return;
          }
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onNext();
            return;
          }
          if (event.key === "Enter" && event.shiftKey) {
            event.preventDefault();
            onPrevious();
          }
        }}
        placeholder="Rechercher dans ce texte…"
        aria-label="Recherche dans le texte"
        className="focus-kb w-full bg-transparent font-reader text-lg text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]"
      />
      {hasQuery ? (
        <p className="mt-2 text-metadata text-[var(--ink-muted)]">
          {resultCount > 0
            ? `${activeIndex + 1} / ${resultCount}`
            : "Aucun résultat"}
        </p>
      ) : null}
    </div>
  );
}
