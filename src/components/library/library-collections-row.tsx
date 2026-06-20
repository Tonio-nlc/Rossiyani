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
    <div className="library-catalog-filter-row" role="group" aria-label="Collections">
      <button
        type="button"
        aria-pressed={active === "all"}
        onClick={() => onSelect("all")}
        className={[
          "library-catalog-filter focus-kb",
          active === "all" ? "library-catalog-filter-active" : "",
        ].join(" ")}
      >
        Toutes
      </button>
      {collections.map((collection) => (
        <button
          key={collection.id}
          type="button"
          aria-pressed={active === collection.id}
          onClick={() => onSelect(collection.id as CollectionId)}
          className={[
            "library-catalog-filter focus-kb",
            active === collection.id ? "library-catalog-filter-active" : "",
          ].join(" ")}
        >
          {collection.name}
        </button>
      ))}
    </div>
  );
}
