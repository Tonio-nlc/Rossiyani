"use client";

import Link from "next/link";
import { memo } from "react";

import type { TextListItem } from "@/features/texts";

import { LibraryCardActions } from "./library-card-actions";
import { LibraryCardProgress } from "./library-card-progress";
import {
  estimateReadingMinutes,
  estimateWordCount,
  formatStat,
  getTextPreviewLine,
  splitLibraryTitle,
} from "./library-utils";

type LibraryCardProps = {
  text: TextListItem;
  disabled?: boolean;
  onRename: (text: TextListItem) => void;
  onDelete: (text: TextListItem) => void;
};

export const LibraryCard = memo(function LibraryCard({
  text,
  disabled = false,
  onRename,
  onDelete,
}: LibraryCardProps) {
  const minutes = estimateReadingMinutes(text.sentenceCount);
  const words = formatStat(estimateWordCount(text.sentenceCount));
  const { russian } = splitLibraryTitle(text.title);
  const preview = getTextPreviewLine(text.collectionId);

  return (
    <article className="library-catalog-card group relative h-full">
      <div className="library-catalog-card-menu">
        <LibraryCardActions
          disabled={disabled}
          catalog
          onRename={() => onRename(text)}
          onDelete={() => onDelete(text)}
        />
      </div>

      <p className="library-catalog-card-level">{text.level}</p>

      <h2 className="library-catalog-card-title font-reader break-russian">
        <Link
          href={`/texts/${text.id}`}
          prefetch
          className="focus-kb outline-none after:absolute after:inset-0"
        >
          {russian}
        </Link>
      </h2>

      <p className="library-catalog-card-meta">
        {minutes} min &bull; {words} mots
      </p>

      <p className="library-catalog-card-preview">{preview}</p>

      <LibraryCardProgress textId={text.id} compact />

      <p className="library-catalog-card-cta">
        <Link
          href={`/texts/${text.id}`}
          prefetch
          className="library-catalog-card-cta-link focus-kb relative z-10 outline-none"
        >
          Lire &rarr;
        </Link>
      </p>
    </article>
  );
});
