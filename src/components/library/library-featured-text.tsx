"use client";

import { getCategoryLabel } from "@/content/categories";
import { getCollectionName } from "@/content/collections";
import { EditorialCard, PrimaryButton } from "@/components/design-system";
import type { TextListItem } from "@/features/texts";

import { LibraryCardProgress } from "./library-card-progress";
import { estimateReadingMinutes, getTextCategoryIds } from "./library-utils";

type LibraryFeaturedTextProps = {
  text: TextListItem;
};

export function LibraryFeaturedText({ text }: LibraryFeaturedTextProps) {
  const collectionName = getCollectionName(text.collectionId);
  const categories = getTextCategoryIds(text);
  const minutes = estimateReadingMinutes(text.sentenceCount);
  const categoryLabel = categories[0] ? getCategoryLabel(categories[0]) : null;

  return (
    <section className="library-page-section space-y-4" aria-label="Texte à la une">
      <p className="text-eyebrow">À la une</p>
      <EditorialCard
        href={`/texts/${text.id}`}
        featured
        eyebrow={collectionName}
        title={text.title}
        subtitle={categoryLabel ?? undefined}
        meta={`${text.level} · ${minutes} min · ${text.sentenceCount} phrase${text.sentenceCount === 1 ? "" : "s"}`}
        footer={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <LibraryCardProgress textId={text.id} />
            <PrimaryButton href={`/texts/${text.id}`}>Continuer la lecture</PrimaryButton>
          </div>
        }
      />
    </section>
  );
}
