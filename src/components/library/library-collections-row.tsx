"use client";

import { getAllCollections, type CollectionId } from "@/content/collections";

import type { LibraryCollectionFilter } from "./library-utils";

type LibraryCollectionsRowProps = {
  active: LibraryCollectionFilter;
  onSelect: (collection: LibraryCollectionFilter) => void;
};

export function LibraryCollectionsRow({ active, onSelect }: LibraryCollectionsRowProps) {
  const collections = getAllCollections();

  return (
    <section
      className="library-page-section library-catalog-filters-section pb-0"
      aria-label="Collections"
    >
      <div className="library-catalog-filter-row" role="group" aria-label="Collections">
        <button
          type="button"
          aria-pressed={active === "all"}
          onClick={() => onSelect("all")}
          className="library-catalog-filter focus-kb"
        >
          Toutes
        </button>
        {collections.map((collection) => (
          <button
            key={collection.id}
            type="button"
            aria-pressed={active === collection.id}
            onClick={() => onSelect(collection.id as CollectionId)}
            className="library-catalog-filter focus-kb"
          >
            {collection.name}
          </button>
        ))}
      </div>
    </section>
  );
}
