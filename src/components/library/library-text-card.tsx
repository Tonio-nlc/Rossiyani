"use client";

import Link from "next/link";
import { memo } from "react";

import { Badge, Card, TextButton } from "@/components/design-system";
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

type LibraryTextCardProps = {
  text: TextListItem;
  disabled?: boolean;
  onRename: (text: TextListItem) => void;
  onDelete: (text: TextListItem) => void;
};

export const LibraryTextCard = memo(function LibraryTextCard({
  text,
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
    <Card as="article" className="lessons-lesson-card library-ws-text-card ws-card">
      <header className="ws-card__header library-ws-text-card__head">
        <div className="library-ws-text-card__badges">
          <Badge tone="blue">{text.level}</Badge>
          <Badge tone="neutral">{minutes} min</Badge>
        </div>
        <LibraryCardActions
          disabled={disabled}
          workspace
          onRename={() => onRename(text)}
          onDelete={() => onDelete(text)}
        />
      </header>

      <div className="ws-card__body">
        <p className="library-ws-text-card__collection ws-card__eyebrow">{collectionName}</p>
        <h2 className="r3-title ws-card__title library-ws-text-card__title break-russian">
          <Link href={`/texts/${text.id}`} prefetch className="library-ws-text-card__title-link focus-kb">
            {russian}
          </Link>
        </h2>
        <p className="ws-card__desc library-ws-text-card__translation">
          <em>{translation}</em>
        </p>
      </div>

      <div className="ws-card__meta library-ws-text-card__meta">
        <span>{words} mots</span>
        <span className="library-ws-text-card__meta-sep" aria-hidden>
          &bull;
        </span>
        <span>
          {text.sentenceCount} phrase{text.sentenceCount > 1 ? "s" : ""}
        </span>
      </div>

      <LibraryCardProgress textId={text.id} workspace />

      <footer className="ws-card__footer library-ws-text-card__footer">
        <TextButton href={`/texts/${text.id}`} className="lessons-lesson-card__cta library-ws-text-card__cta">
          Lire →
        </TextButton>
      </footer>
    </Card>
  );
});
