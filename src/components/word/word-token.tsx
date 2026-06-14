"use client";

import { memo } from "react";

import type { PartOfSpeech } from "@/types";

type WordTokenProps = {
  wordId?: string;
  stressMarked: string;
  stem: string;
  ending: string;
  partOfSpeech: PartOfSpeech;
  grammaticalCase?: string | null;
  selected?: boolean;
  searchMatch?: boolean;
  searchActive?: boolean;
  hasFullAnalysis?: boolean;
  onClick?: () => void;
};

export const WordToken = memo(function WordToken({
  wordId,
  stressMarked,
  selected,
  searchMatch,
  searchActive,
  hasFullAnalysis,
  onClick,
}: WordTokenProps) {
  return (
    <button
      type="button"
      data-word-id={wordId}
      onClick={onClick}
      className={[
        "focus-kb inline cursor-pointer border-0 bg-transparent p-0 align-baseline font-reader text-inherit transition-opacity duration-150",
        selected
          ? "underline decoration-[var(--color-grammar)] decoration-2 underline-offset-[6px]"
          : searchActive
            ? "underline decoration-[var(--color-culture)] decoration-2 underline-offset-[6px]"
            : searchMatch
              ? "underline decoration-[var(--hairline-strong)] decoration-1 underline-offset-[5px]"
              : hasFullAnalysis
                ? "underline decoration-dotted decoration-[var(--hairline-strong)] underline-offset-[5px]"
                : "hover:opacity-70",
      ].join(" ")}
    >
      {stressMarked}
    </button>
  );
});
