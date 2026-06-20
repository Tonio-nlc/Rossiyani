"use client";

import Link from "next/link";
import { memo } from "react";

import { Tag } from "@/components/design-system";
import { getCollectionName } from "@/content/collections";
import type { TextListItem } from "@/features/texts";

import { LibraryCardActions } from "./library-card-actions";
import { LibraryCardProgress } from "./library-card-progress";
import { estimateReadingMinutes } from "./library-utils";

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

        <p className="mt-2 text-metadata">
          {collectionName} · {minutes} min
        </p>

        <LibraryCardProgress textId={text.id} />
      </Link>
    </article>
  );
});
