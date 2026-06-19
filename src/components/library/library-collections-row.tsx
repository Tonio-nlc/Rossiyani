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
    <section className="library-page-section space-y-4" aria-label="Collections éditoriales">
      <div>
        <p className="text-eyebrow">Collections</p>
        <h2 className="editorial-section-title mt-2">Univers éditoriaux</h2>
      </div>
      <div className="library-collections-scroll">
        <CollectionCard
          name="Toutes"
          description="Parcourir l'ensemble de la bibliothèque"
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
