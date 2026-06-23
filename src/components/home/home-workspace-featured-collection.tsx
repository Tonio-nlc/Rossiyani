import Link from "next/link";

import type { FeaturedCollectionFeature } from "@/lib/home/pick-featured-collection";

import { HomeCollectionCover } from "./home-collection-cover";

type HomeWorkspaceFeaturedCollectionProps = {
  feature: FeaturedCollectionFeature;
};

export function HomeWorkspaceFeaturedCollection({ feature }: HomeWorkspaceFeaturedCollectionProps) {
  return (
    <section className="home-ws-section" aria-label="Featured collection">
      <article className="home-ws-card home-ws-featured-collection">
        <HomeCollectionCover collectionId={feature.id} className="home-ws-featured-collection__cover" />
        <div className="home-ws-featured-collection__body">
          <div className="home-ws-featured-collection__badges">
            {feature.level ? <span className="home-ws-badge">{feature.level}</span> : null}
            <span className="home-ws-badge home-ws-badge--muted">
              {feature.textCount} text{feature.textCount === 1 ? "" : "s"}
            </span>
          </div>
          <h2 className="home-ws-featured-collection__title">{feature.name}</h2>
          <p className="home-ws-featured-collection__description">{feature.description}</p>
          <div className="home-ws-featured-collection__actions">
            <Link href={feature.continueHref} className="home-ws-btn focus-kb">
              Continue Collection
            </Link>
            <Link href={feature.viewHref} className="home-ws-btn--ghost focus-kb">
              View Collection
            </Link>
          </div>
          <Link href="/library" className="home-ws-featured-collection__browse focus-kb">
            Browse all collections →
          </Link>
        </div>
      </article>
    </section>
  );
}
