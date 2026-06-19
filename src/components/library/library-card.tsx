"use client";

import Link from "next/link";
import { memo } from "react";

import { Tag } from "@/components/design-system";
import { getCategoryLabel } from "@/content/categories";
import { getCollectionName } from "@/content/collections";
import type { TextListItem } from "@/features/texts";

import { LibraryCardActions } from "./library-card-actions";
import { LibraryCardProgress } from "./library-card-progress";
import {
  estimateReadingMinutes,
  estimateWordCount,
  getTextCategoryIds,
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
  const tags = getTextCategoryIds(text);
  const minutes = estimateReadingMinutes(text.sentenceCount);
  const wordEstimate = estimateWordCount(text.sentenceCount);
  const collectionName = getCollectionName(text.collectionId);

  return (
    <article className="ds-editorial-card group relative h-full">
      <div className="absolute right-2 top-2 z-30">
        <LibraryCardActions
          disabled={disabled}
          onRename={() => onRename(text)}
          onDelete={() => onDelete(text)}
        />
      </div>

      <Link
        href={`/texts/${text.id}`}
        prefetch
        className="focus-kb ds-editorial-card-link flex h-full flex-col pr-8 outline-none"
      >
        <div className="flex items-center justify-between gap-3">
          <Tag>{text.level}</Tag>
          <span className="text-metadata">{minutes} min</span>
        </div>

        <h2 className="mt-3 font-reader text-lg font-medium leading-snug text-[var(--ink)] break-russian transition group-hover:text-[var(--color-primary)]">
          {text.title}
        </h2>

        <p className="mt-1.5 text-sm text-[var(--ink-secondary)]">{collectionName}</p>

        {tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tagId) => (
              <Tag key={tagId}>{getCategoryLabel(tagId)}</Tag>
            ))}
          </div>
        ) : null}

        <LibraryCardProgress textId={text.id} />

        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[var(--hairline)] pt-4">
          <Metric label="Phrases" value={String(text.sentenceCount)} />
          <Metric label="Mots" value={`≈${wordEstimate}`} muted />
        </div>
      </Link>
    </article>
  );
});

function Metric({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <p className={muted ? "text-metadata" : "text-sm font-medium text-[var(--ink)]"}>{value}</p>
      <p className="text-eyebrow mt-0.5">{label}</p>
    </div>
  );
}
