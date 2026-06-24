import Link from "next/link";

import type { FeaturedCollectionFeature } from "@/lib/home/pick-featured-collection";

import { HomeReadingCover } from "./home-reading-cover";

type HomeWorkspaceFeaturedCollectionProps = {
  feature: FeaturedCollectionFeature;
};

function formatMetric(value: number): string {
  return value.toLocaleString("en-US");
}

export function HomeWorkspaceFeaturedCollection({ feature }: HomeWorkspaceFeaturedCollectionProps) {
  return (
    <section className="home-ws-section" aria-labelledby="home-ws-featured-heading">
      <div className="home-ws-section__head">
        <h2 id="home-ws-featured-heading" className="home-ws-section__title">
          Your learning path
        </h2>
        <p className="home-ws-section__subtitle">
          Track momentum across lessons in this path.
        </p>
      </div>
      <article className="home-ws-card home-ws-featured-collection">
        <HomeReadingCover collectionId={feature.id} className="home-ws-featured-collection__cover" />
        <div className="home-ws-featured-collection__body">
          <div className="home-ws-featured-collection__badges">
            {feature.level ? <span className="home-ws-badge">{feature.level}</span> : null}
            <span className="home-ws-badge home-ws-badge--muted">
              {feature.textCount} text{feature.textCount === 1 ? "" : "s"}
            </span>
          </div>
          <h2 className="home-ws-featured-collection__title">{feature.name}</h2>
          <p className="home-ws-featured-collection__description">{feature.description}</p>

          <div className="home-ws-featured-collection__stats">
            <p className="home-ws-featured-collection__stats-label">Path progress</p>
            <ul className="home-ws-featured-collection__stats-list">
              <li>{formatMetric(feature.wordsDiscovered)} words discovered</li>
              <li>{formatMetric(feature.conceptsExplored)} concepts explored</li>
              <li>{feature.averageReadingMinutes} minutes average reading time</li>
            </ul>
          </div>

          <div className="home-ws-featured-collection__actions">
            <Link href={feature.continueHref} className="home-ws-btn focus-kb">
              Continue path →
            </Link>
            <Link href={feature.viewHref} className="home-ws-btn--ghost focus-kb">
              View lessons
            </Link>
          </div>
          <Link href="/library" className="home-ws-link home-ws-featured-collection__browse focus-kb">
            See all paths →
          </Link>
        </div>
      </article>
    </section>
  );
}
