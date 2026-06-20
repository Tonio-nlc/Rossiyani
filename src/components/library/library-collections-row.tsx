"use client";

import { getAllCollections, type CollectionId } from "@/content/collections";
import { CollectionCard } from "@/components/design-system";

import type { LibraryCollectionFilter } from "./library-utils";

type LibraryCollectionsRowProps = {
  active: LibraryCollectionFilter;
  onSelect: (collection: LibraryCollectionFilter) => void;
};

export function LibraryCollectionsRow({ active, onSelect }: LibraryCollectionsRowProps) {
  const collections = getAllCollections();

  return (
    <section className="library-page-section space-y-3" aria-label="Collections éditoriales">
      <p className="text-eyebrow">Collections</p>
      <div className="library-collections-scroll">
        <CollectionCard
          name="Toutes"
          active={active === "all"}
          onClick={() => onSelect("all")}
        />
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            name={collection.name}
            description={collection.description}
            active={active === collection.id}
            onClick={() => onSelect(collection.id as CollectionId)}
          />
        ))}
      </div>
    </section>
  );
}
