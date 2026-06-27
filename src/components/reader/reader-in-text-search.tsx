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
    <div className="reader-ws-search__inner">
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
        aria-label="Rechercher dans le texte"
        className="reader-ws-search__input focus-kb"
      />
      {hasQuery ? (
        <p className="reader-ws-search__meta" aria-live="polite">
          {resultCount > 0 ? `${activeIndex + 1} / ${resultCount}` : "Aucun résultat"}
        </p>
      ) : null}
    </div>
  );
}
