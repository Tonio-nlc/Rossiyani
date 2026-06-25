import Link from "next/link";

import { HomeCollectionCover } from "@/components/home/home-collection-cover";
import type { LibraryCollectionSummary } from "@/lib/library/build-library-collections";

type LibraryWorkspaceCollectionCardProps = {
  collection: LibraryCollectionSummary;
  mode?: "featured" | "browse";
};

function formatMetric(value: number): string {
  return value.toLocaleString("fr-FR");
}

export function LibraryWorkspaceCollectionCard({
  collection,
  mode = "featured",
}: LibraryWorkspaceCollectionCardProps) {
  if (mode === "browse") {
    return (
      <Link
        href={`/library?collection=${collection.id}`}
        className="library-ws-card library-ws-collection-card library-ws-collection-card--browse focus-kb"
      >
        <HomeCollectionCover
          collectionId={collection.id}
          className="library-ws-collection-cover"
        />
        <div className="library-ws-collection-card__body">
          <p className="library-ws-collection-card__name">{collection.name}</p>
          <h3 className="library-ws-collection-card__russian break-russian">
            {collection.russianTitle}
          </h3>
          <div className="library-ws-collection-card__badges">
            {collection.level ? (
              <span className="library-ws-badge">{collection.level}</span>
            ) : null}
            <span className="library-ws-badge library-ws-badge--muted">
              {collection.textCount} text{collection.textCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  const readingMinutes =
    collection.readingMinutesTotal || collection.averageReadingMinutes;

  return (
    <article className="library-ws-card library-ws-collection-card library-ws-collection-card--hero">
      <HomeCollectionCover
        collectionId={collection.id}
        className="library-ws-collection-cover"
      />
      <div className="library-ws-collection-card__body">
        <p className="library-ws-collection-card__eyebrow">Collection</p>
        <p className="library-ws-collection-card__name">{collection.name}</p>
        <h3 className="library-ws-collection-card__russian break-russian">
          {collection.russianTitle}
        </h3>

        <dl className="library-ws-collection-card__stats">
          <div>
            <dt>Reading time</dt>
            <dd>{readingMinutes} min</dd>
          </div>
          <div>
            <dt>Vocabulary discovered</dt>
            <dd>{formatMetric(collection.wordsDiscovered)}</dd>
          </div>
          <div>
            <dt>Concepts explored</dt>
            <dd>{formatMetric(collection.conceptsExplored)}</dd>
          </div>
          <div>
            <dt>Texts</dt>
            <dd>{collection.textCount}</dd>
          </div>
        </dl>

        <div className="library-ws-collection-card__progress">
          <div className="library-ws-collection-card__progress-label">
            <span>Progress</span>
            <span>{collection.progressPercent}%</span>
          </div>
          <div
            className="library-ws-collection-card__progress-bar"
            role="progressbar"
            aria-valuenow={collection.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="library-ws-collection-card__progress-fill"
              style={{ width: `${collection.progressPercent}%` }}
            />
          </div>
        </div>

        <Link href={collection.continueHref} className="library-ws-btn library-ws-collection-card__cta focus-kb">
          Continue collection →
        </Link>
      </div>
    </article>
  );
}
