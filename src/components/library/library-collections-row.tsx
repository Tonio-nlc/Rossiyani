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
    <div className="lib-filter-row" role="group" aria-label="Collections">
      <button
        type="button"
        aria-pressed={active === "all"}
        onClick={() => onSelect("all")}
        className={[
          "lib-filter focus-kb",
          active === "all" ? "lib-filter-active" : "",
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
            "lib-filter focus-kb",
            active === collection.id ? "lib-filter-active" : "",
          ].join(" ")}
        >
          {collection.name}
        </button>
      ))}
    </div>
  );
}
