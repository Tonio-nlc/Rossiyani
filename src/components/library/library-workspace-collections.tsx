"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  buildLibraryCollections,
  pickActiveCollection,
} from "@/lib/library/build-library-collections";
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
  showAllCollections?: boolean;
};

export function LibraryWorkspaceCollections({
  texts,
  activeCollection = null,
  clientReady,
  showAllCollections = false,
}: LibraryWorkspaceCollectionsProps) {
  const readingProgress = useMemo(
    () => (clientReady ? getAllReadingProgress() : {}),
    [clientReady],
  );

  const exploration = useMemo(
    () => (clientReady ? getExplorationHistory() : []),
    [clientReady],
  );

  const active = useMemo(
    () => pickActiveCollection(texts, readingProgress, exploration, activeCollection),
    [texts, readingProgress, exploration, activeCollection],
  );

  const browseCollections = useMemo(() => {
    if (!showAllCollections) {
      return [];
    }
    return buildLibraryCollections({ texts, readingProgress, exploration }).filter(
      (collection) => collection.id !== active?.id,
    );
  }, [texts, readingProgress, exploration, showAllCollections, active?.id]);

  if (!active) {
    return null;
  }

  return (
    <section
      className="library-ws-section library-ws-section--featured"
      aria-labelledby="library-ws-featured-heading"
    >
      <div className="library-ws-section__head library-ws-section__head--row">
        <h2 id="library-ws-featured-heading" className="library-ws-section__title">
          Current collection
        </h2>
        {!showAllCollections ? (
          <Link href="/library?collections=all" className="library-ws-link library-ws-link--subtle focus-kb">
            View all collections →
          </Link>
        ) : (
          <Link href="/library" className="library-ws-link library-ws-link--subtle focus-kb">
            Back to library →
          </Link>
        )}
      </div>

      <LibraryWorkspaceCollectionCard collection={active} mode="featured" />

      {showAllCollections && browseCollections.length > 0 ? (
        <>
          <hr className="library-ws-separator library-ws-separator--inset" />
          <ul className="library-ws-collections library-ws-collections--browse">
            {browseCollections.map((collection) => (
              <li key={collection.id}>
                <LibraryWorkspaceCollectionCard collection={collection} mode="browse" />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

export function parseLibraryCollectionParam(value: string | null): CollectionId | null {
  if (!value || !isCollectionId(value)) {
    return null;
  }
  return value;
}
