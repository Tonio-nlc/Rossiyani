"use client";

import Link from "next/link";
import { memo } from "react";

import { getCategoryLabel } from "@/content/categories";
import type { TextListItem } from "@/features/texts";

import { LibraryCardActions } from "./library-card-actions";
import {
  estimateReadingMinutes,
  estimateWordCount,
  formatStat,
  getCefrLevelLabel,
  getTextCategoryIds,
  getTextDescription,
  splitLibraryTitle,
} from "./library-utils";

type LibraryTextCardProps = {
  text: TextListItem;
  featured?: boolean;
  disabled?: boolean;
  onRename: (text: TextListItem) => void;
  onDelete: (text: TextListItem) => void;
};

function BookIcon() {
  return (
    <svg
      className="lib-text-card__meta-icon"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.5 2.75h4.25a1.25 1.25 0 0 1 1.25 1.25V13L5.125 11.375 2.5 13V2.75Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 2.75H9.25a1.25 1.25 0 0 0-1.25 1.25V13l2.625-1.625L13.5 13V2.75Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      className="lib-text-card__meta-icon"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.1" />
      <path d="M8 5.25V8l2 1.25" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export const LibraryTextCard = memo(function LibraryTextCard({
  text,
  featured = false,
  disabled = false,
  onRename,
  onDelete,
}: LibraryTextCardProps) {
  const minutes = estimateReadingMinutes(text.sentenceCount);
  const words = formatStat(estimateWordCount(text.sentenceCount));
  const { russian, french } = splitLibraryTitle(text.title);
  const categories = getTextCategoryIds(text);
  const translation =
    french ?? (categories[0] ? getCategoryLabel(categories[0]) : "Texte en russe");
  const description = getTextDescription(text.collectionId);
  const levelLabel = getCefrLevelLabel(text.level);

  return (
    <article
      className="lib-text-card"
      data-featured={featured ? "true" : undefined}
    >
      <div className="lib-text-card__head">
        <span className="lib-text-card__badge">
          {text.level} &bull; {levelLabel}
        </span>
        <LibraryCardActions
          disabled={disabled}
          editorial
          onRename={() => onRename(text)}
          onDelete={() => onDelete(text)}
        />
      </div>

      <div className="lib-text-card__body">
        <h2 className="lib-text-card__title font-reader break-russian">
          <Link href={`/texts/${text.id}`} prefetch className="lib-text-card__title-link focus-kb">
            {russian}
          </Link>
        </h2>

        <p className="lib-text-card__translation">
          <em>{translation}</em>
        </p>

        <p className="lib-text-card__description">{description}</p>
      </div>

      <footer className="lib-text-card__footer">
        <div className="lib-text-card__meta">
          <span className="lib-text-card__meta-item">
            <BookIcon />
            {words} mots
          </span>
          <span className="lib-text-card__meta-sep" aria-hidden>
            &bull;
          </span>
          <span className="lib-text-card__meta-item">
            <ClockIcon />
            {minutes} min
          </span>
          <span className="lib-text-card__meta-sep" aria-hidden>
            &bull;
          </span>
          <span className="lib-text-card__meta-item">
            {text.sentenceCount} phrase{text.sentenceCount > 1 ? "s" : ""}
          </span>
        </div>
        <Link href={`/texts/${text.id}`} prefetch className="lib-text-card__cta focus-kb">
          Lire →
        </Link>
      </footer>
    </article>
  );
});
