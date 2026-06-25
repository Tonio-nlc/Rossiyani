import Link from "next/link";

import { HomeCollectionCover } from "@/components/home/home-collection-cover";
import type { LibraryCollectionSummary } from "@/lib/library/build-library-collections";

type LibraryWorkspaceCollectionCardProps = {
  collection: LibraryCollectionSummary;
  active?: boolean;
};

function formatMetric(value: number): string {
  return value.toLocaleString("fr-FR");
}

export function LibraryWorkspaceCollectionCard({
  collection,
  active = false,
}: LibraryWorkspaceCollectionCardProps) {
  const layoutClass = `library-ws-collection-card--${collection.layout}`;
  const href = `/library?collection=${collection.id}`;

  return (
    <Link
      href={href}
      className={[
        "library-ws-card library-ws-collection-card focus-kb",
        layoutClass,
        active ? "library-ws-collection-card--active" : "",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      <HomeCollectionCover
        collectionId={collection.id}
        className="library-ws-collection-cover"
      />
      <div className="library-ws-collection-card__body">
        <p className="library-ws-collection-card__eyebrow">Collection</p>
        <h3 className="library-ws-collection-card__russian break-russian">
          {collection.russianTitle}
        </h3>
        <p className="library-ws-collection-card__name">{collection.name}</p>

        <div className="library-ws-collection-card__badges">
          {collection.level ? (
            <span className="library-ws-badge">{collection.level}</span>
          ) : null}
          <span className="library-ws-badge library-ws-badge--muted">
            {collection.textCount} text{collection.textCount === 1 ? "" : "s"}
          </span>
        </div>

        <ul className="library-ws-collection-card__meta">
          <li>
            <span>Reading time</span>
            <strong>
              {collection.readingMinutesTotal || collection.averageReadingMinutes} min
            </strong>
          </li>
          <li>
            <span>Vocabulary discovered</span>
            <strong>{formatMetric(collection.wordsDiscovered)}</strong>
          </li>
          <li>
            <span>Concepts explored</span>
            <strong>{formatMetric(collection.conceptsExplored)}</strong>
          </li>
        </ul>

        <div className="library-ws-collection-card__progress">
          <div className="library-ws-collection-card__progress-label">
            <span>Progress</span>
            <span>{collection.progressPercent}%</span>
          </div>
          <div className="library-ws-collection-card__progress-bar" aria-hidden>
            <div
              className="library-ws-collection-card__progress-fill"
              style={{ width: `${collection.progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
