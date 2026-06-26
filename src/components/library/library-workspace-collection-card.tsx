import { Badge, Card, PrimaryButton } from "@/components/design-system";
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
      <Card
        href={`/library?collection=${collection.id}`}
        className="library-ws-collection-card library-ws-collection-card--browse"
      >
        <HomeCollectionCover collectionId={collection.id} className="library-ws-collection-cover" />
        <div className="library-ws-collection-card__body">
          <p className="library-ws-collection-card__name">{collection.name}</p>
          <h3 className="library-ws-collection-card__russian break-russian">
            {collection.russianTitle}
          </h3>
          <div className="library-ws-collection-card__badges">
            {collection.level ? <Badge tone="blue">{collection.level}</Badge> : null}
            <Badge tone="neutral">
              {collection.textCount} text{collection.textCount === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  const readingMinutes = collection.readingMinutesTotal || collection.averageReadingMinutes;

  return (
    <Card
      as="article"
      hero
      className="library-ws-collection-card library-ws-collection-card--hero r3-editorial-split r3-hero-card--split"
    >
      <div className="r3-editorial-split__visual">
        <HomeCollectionCover collectionId={collection.id} className="library-ws-collection-cover" />
      </div>

      <div className="r3-editorial-split__body library-ws-collection-card__body">
        <header className="library-ws-collection-card__header">
          <p className="r3-eyebrow library-ws-collection-card__eyebrow">Collection</p>
          <p className="library-ws-collection-card__name">{collection.name}</p>
          <h3 className="r3-hero-title library-ws-collection-card__russian break-russian">
            {collection.russianTitle}
          </h3>
        </header>

        <dl className="library-ws-collection-card__stats">
          <div>
            <dt>Reading</dt>
            <dd>{readingMinutes} min</dd>
          </div>
          <div>
            <dt>Vocabulary</dt>
            <dd>{formatMetric(collection.wordsDiscovered)}</dd>
          </div>
          <div>
            <dt>Concepts</dt>
            <dd>{formatMetric(collection.conceptsExplored)}</dd>
          </div>
          <div>
            <dt>Texts</dt>
            <dd>{collection.textCount}</dd>
          </div>
        </dl>

        <div className="library-ws-collection-card__footer">
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

          <PrimaryButton href={collection.continueHref} className="library-ws-collection-card__cta">
            Continue →
          </PrimaryButton>
        </div>
      </div>
    </Card>
  );
}
