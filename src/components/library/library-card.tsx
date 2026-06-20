"use client";

import Link from "next/link";
import { memo } from "react";

import { getCategoryLabel } from "@/content/categories";
import type { TextListItem } from "@/features/texts";

import { LibraryCardActions } from "./library-card-actions";
import { LibraryCardProgress } from "./library-card-progress";
import {
  estimateReadingMinutes,
  estimateWordCount,
  formatStat,
  getTextCategoryIds,
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
  const { russian, french } = splitLibraryTitle(text.title);
  const categories = getTextCategoryIds(text);
  const translation =
    french ?? (categories[0] ? getCategoryLabel(categories[0]) : null);
  const preview = getTextPreviewLine(text.collectionId);

  return (
    <article className="library-catalog-card group relative h-full">
      <div className="absolute right-1.5 top-1.5 z-30">
        <LibraryCardActions
          disabled={disabled}
          onRename={() => onRename(text)}
          onDelete={() => onDelete(text)}
        />
      </div>

      <p className="library-catalog-card-level">{text.level}</p>

      <h2 className="library-catalog-card-title font-reader break-russian">
        <Link href={`/texts/${text.id}`} prefetch className="focus-kb outline-none after:absolute after:inset-0">
          {russian}
        </Link>
      </h2>

      {translation ? (
        <p className="library-catalog-card-translation">{translation}</p>
      ) : null}

      <p className="library-catalog-card-meta">
        {minutes} min · {words} mots
      </p>

      <p className="library-catalog-card-preview">{preview}</p>

      <LibraryCardProgress textId={text.id} compact />

      <p className="library-catalog-card-cta">
        <Link
          href={`/texts/${text.id}`}
          prefetch
          className="library-catalog-card-cta-link focus-kb relative z-10 outline-none"
        >
          Lire →
        </Link>
      </p>
    </article>
  );
});
