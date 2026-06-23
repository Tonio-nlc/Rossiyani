import Link from "next/link";

import { GhostButton, PrimaryButton } from "@/components/design-system";
import type { FeaturedCollectionFeature } from "@/lib/home/pick-featured-collection";

import { HomeCollectionCover } from "./home-collection-cover";

type HomeWorkspaceFeaturedCollectionProps = {
  feature: FeaturedCollectionFeature;
};

export function HomeWorkspaceFeaturedCollection({ feature }: HomeWorkspaceFeaturedCollectionProps) {
  return (
    <section className="home-ws-section" aria-labelledby="home-ws-featured-collection-heading">
      <div className="home-ws-section__head">
        <h2 id="home-ws-featured-collection-heading" className="home-ws-section__title">
          Featured collection
        </h2>
      </div>

      <article className="home-ws-card home-ws-featured-collection">
        <HomeCollectionCover collectionId={feature.id} className="home-ws-featured-collection__cover" />
        <div className="home-ws-featured-collection__body">
          <div className="home-ws-featured-collection__badges">
            {feature.level ? <span className="home-ws-badge">{feature.level}</span> : null}
            <span className="home-ws-badge home-ws-badge--muted">
              {feature.textCount} text{feature.textCount === 1 ? "" : "s"}
            </span>
          </div>
          <h3 className="home-ws-featured-collection__title">{feature.name}</h3>
          <p className="home-ws-featured-collection__description">{feature.description}</p>
          <div className="home-ws-featured-collection__actions">
            <PrimaryButton href={feature.continueHref}>Continue Collection</PrimaryButton>
            <GhostButton href={feature.viewHref}>View Collection</GhostButton>
          </div>
          <Link href="/library" className="home-ws-featured-collection__browse focus-kb">
            Browse all collections →
          </Link>
        </div>
      </article>
    </section>
  );
}
