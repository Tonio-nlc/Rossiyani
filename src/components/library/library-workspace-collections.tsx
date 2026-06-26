"use client";

import { useMemo } from "react";

import { Card, PrimaryButton } from "@/components/design-system";
import { EditorialCollectionCard } from "@/components/shared/editorial-collection-card";
import {
  buildLibraryCollections,
  pickActiveCollection,
} from "@/lib/library/build-library-collections";
import { getExplorationHistory } from "@/lib/explorer/exploration-history";
import { getAllReadingProgress } from "@/lib/reader/reading-progress";
import type { TextListItem } from "@/features/texts";
import type { CollectionId } from "@/content/collections";
import { isCollectionId } from "@/content/collections";

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
  const readingProgress = useMemo(
    () => (clientReady ? getAllReadingProgress() : {}),
    [clientReady],
  );

  const exploration = useMemo(
    () => (clientReady ? getExplorationHistory() : []),
    [clientReady],
  );

  const collections = useMemo(
    () => buildLibraryCollections({ texts, readingProgress, exploration }),
    [texts, readingProgress, exploration],
  );

  const active = useMemo(
    () => pickActiveCollection(texts, readingProgress, exploration, activeCollection),
    [texts, readingProgress, exploration, activeCollection],
  );

  if (collections.length === 0) {
    return null;
  }

  return (
    <>
      {active && active.progressPercent > 0 ? (
        <section className="lessons-section" aria-labelledby="library-continue-heading">
          <div className="lessons-section__head">
            <h2 id="library-continue-heading" className="r3-title lessons-section__title">
              Continuer
            </h2>
          </div>
          <Card as="article" interactive className="lessons-continue ws-card">
            <div className="ws-card__body">
              <p className="lessons-continue__label ws-card__eyebrow">Collection en cours</p>
              <p className="r3-title lessons-continue__title ws-card__title break-russian">
                {active.russianTitle}
              </p>
              <p className="lessons-continue__meta ws-card__desc">
                {active.name} · {active.textCount} texte{active.textCount === 1 ? "" : "s"} ·{" "}
                {active.progressPercent}% lu
              </p>
            </div>
            <footer className="ws-card__footer">
              <PrimaryButton href={active.continueHref} className="lessons-continue__cta">
                Reprendre →
              </PrimaryButton>
            </footer>
          </Card>
        </section>
      ) : null}

      <section className="lessons-section" aria-labelledby="library-collections-heading">
        <div className="lessons-section__head">
          <div>
            <h2 id="library-collections-heading" className="r3-title lessons-section__title">
              Collections
            </h2>
            <p className="r3-lead lessons-section__subtitle">
              Parcours thématiques — le cœur de votre bibliothèque.
            </p>
          </div>
        </div>

        <div className="lessons-grid lessons-grid--collections ws-card-grid ws-card-grid--collections">
          {collections.map((collection) => (
            <div key={collection.id} className="ws-card-grid__cell">
              <EditorialCollectionCard
                id={collection.id}
                title={collection.name}
                description={collection.description}
                href={`/library?collection=${collection.id}`}
                level={collection.level}
                textCount={collection.textCount}
                progressPercent={collection.progressPercent}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function parseLibraryCollectionParam(value: string | null): CollectionId | null {
  if (!value || !isCollectionId(value)) {
    return null;
  }
  return value;
}
