"use client";

import Link from "next/link";
import { memo } from "react";

import { getCategoryLabel } from "@/content/categories";
import { getCollectionName } from "@/content/collections";
import type { TextListItem } from "@/features/texts";

import { LibraryCardActions } from "./library-card-actions";
import { LibraryCardProgress } from "./library-card-progress";
import {
  estimateReadingMinutes,
  estimateWordCount,
  formatStat,
  getTextCategoryIds,
  splitLibraryTitle,
} from "./library-utils";

export type LibraryTextCardVariant = "featured" | "standard" | "compact";

type LibraryTextCardProps = {
  text: TextListItem;
  variant?: LibraryTextCardVariant;
  disabled?: boolean;
  onRename: (text: TextListItem) => void;
  onDelete: (text: TextListItem) => void;
};

export const LibraryTextCard = memo(function LibraryTextCard({
  text,
  variant = "standard",
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
  const collectionName = getCollectionName(text.collectionId);

  return (
    <article
      className={[
        "library-ws-card library-ws-text-card",
        variant === "featured" ? "library-ws-text-card--featured" : "",
      ].join(" ")}
    >
      <div className="library-ws-text-card__head">
        <div className="library-ws-text-card__badges">
          <span className="library-ws-badge">{text.level}</span>
          <span className="library-ws-badge library-ws-badge--muted">{minutes} min</span>
        </div>
        <LibraryCardActions
          disabled={disabled}
          workspace
          onRename={() => onRename(text)}
          onDelete={() => onDelete(text)}
        />
      </div>

      <p className="library-ws-text-card__collection">{collectionName}</p>

      <h2 className="library-ws-text-card__title break-russian">
        <Link href={`/texts/${text.id}`} prefetch className="library-ws-text-card__title-link focus-kb">
          {russian}
        </Link>
      </h2>

      <p className="library-ws-text-card__translation">
        <em>{translation}</em>
      </p>

      <div className="library-ws-text-card__meta">
        <span>{words} mots</span>
        <span className="library-ws-text-card__meta-sep" aria-hidden>
          &bull;
        </span>
        <span>
          {text.sentenceCount} phrase{text.sentenceCount > 1 ? "s" : ""}
        </span>
      </div>

      <LibraryCardProgress textId={text.id} workspace />

      <footer className="library-ws-text-card__footer">
        <Link href={`/texts/${text.id}`} prefetch className="library-ws-text-card__cta focus-kb">
          Lire →
        </Link>
      </footer>
    </article>
  );
});
