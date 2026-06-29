"use client";

import { memo } from "react";

import type { WordHighlightKind } from "@/lib/reader/build-interactive-words";
import type { PartOfSpeech } from "@/types";

type WordTokenProps = {
  wordId?: string;
  stressMarked: string;
  stem: string;
  ending: string;
  partOfSpeech: PartOfSpeech;
  grammaticalCase?: string | null;
  selected?: boolean;
  hovered?: boolean;
  searchMatch?: boolean;
  searchActive?: boolean;
  interactive?: boolean;
  highlightKind?: WordHighlightKind | null;
  guideLinked?: boolean;
  onClick?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
};

const HIGHLIGHT_CLASS: Record<WordHighlightKind, string> = {
  pattern: "reader-word-pattern",
  verb: "reader-word-verb",
  construction: "reader-word-construction",
  grammar: "reader-word-grammar",
  noun: "reader-word-noun",
};

export const WordToken = memo(function WordToken({
  wordId,
  stressMarked,
  selected,
  hovered,
  searchMatch,
  searchActive,
  interactive = false,
  highlightKind = null,
  guideLinked = false,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: WordTokenProps) {
  if (!interactive) {
    return (
      <span data-word-id={wordId} className="font-reader text-inherit">
        {stressMarked}
      </span>
    );
  }

  return (
    <button
      type="button"
      data-word-id={wordId}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={[
        "reader-word-interactive focus-kb inline cursor-pointer border-0 bg-transparent p-0 align-baseline font-reader text-inherit",
        "transition-[background-color,text-decoration-color] duration-150",
        highlightKind ? HIGHLIGHT_CLASS[highlightKind] : "",
        guideLinked ? "reader-word-guide-linked" : "",
        selected
          ? "reader-word-selected"
          : searchActive
            ? "reader-word-search-active"
            : searchMatch
              ? "reader-word-search-match"
              : "",
        hovered && !selected ? "reader-word-hover" : "",
      ].join(" ")}
    >
      {stressMarked}
    </button>
  );
});
