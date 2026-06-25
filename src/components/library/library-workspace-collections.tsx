"use client";

import { useMemo } from "react";

import { buildLibraryCollections } from "@/lib/library/build-library-collections";
import { getExplorationHistory } from "@/lib/explorer/exploration-history";
import { getAllReadingProgress } from "@/lib/reader/reading-progress";
import type { TextListItem } from "@/features/texts";
import type { CollectionId } from "@/content/collections";
import { isCollectionId } from "@/content/collections";

import { LibraryWorkspaceCollectionCard } from "./library-workspace-collection-card";

type LibraryWorkspaceCollectionsProps = {
  texts: TextListItem[];
  activeCollection?: CollectionId | null;
  clientReady: boolean;
};

export function LibraryWorkspaceCollections({
  texts,
  activeCollection = null,
  clientReady,
}: LibraryWorkspaceCollectionsProps) {
  const collections = useMemo(() => {
    if (!clientReady) {
      return buildLibraryCollections({ texts, readingProgress: {} });
    }
    return buildLibraryCollections({
      texts,
      readingProgress: getAllReadingProgress(),
      exploration: getExplorationHistory(),
    });
  }, [texts, clientReady]);

  const visible = activeCollection
    ? collections.filter((collection) => collection.id === activeCollection)
    : collections;

  if (visible.length === 0) {
    return null;
  }

  return (
    <section className="library-ws-section" aria-labelledby="library-ws-collections-heading">
      <div className="library-ws-section__head">
        <h2 id="library-ws-collections-heading" className="library-ws-section__title">
          {activeCollection ? "Collection" : "Collections"}
        </h2>
        <p className="library-ws-section__subtitle">
          {activeCollection
            ? "Progress and metadata for this curated path."
            : "Your curated Russian library — browse by collection and track progress."}
        </p>
      </div>

      <ul className="library-ws-collections">
        {visible.map((collection) => (
          <li
            key={collection.id}
            className={`library-ws-collections__item--${collection.layout}`}
          >
            <LibraryWorkspaceCollectionCard
              collection={collection}
              active={activeCollection === collection.id}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function parseLibraryCollectionParam(value: string | null): CollectionId | null {
  if (!value || !isCollectionId(value)) {
    return null;
  }
  return value;
}
