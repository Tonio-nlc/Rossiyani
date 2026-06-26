import { Badge, Card, GhostButton, PrimaryButton, TextButton } from "@/components/design-system";
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
        <h2 id="home-ws-featured-heading" className="r3-title home-ws-section__title">
          Learning path
        </h2>
        <p className="r3-lead home-ws-section__subtitle">
          Track momentum across lessons in this path.
        </p>
      </div>

      <Card
        as="article"
        className="home-ws-featured-collection r3-editorial-split r3-hero-card--split"
      >
        <div className="r3-editorial-split__visual">
          <HomeReadingCover collectionId={feature.id} className="home-ws-featured-collection__cover" />
        </div>

        <div className="r3-editorial-split__body home-ws-featured-collection__body">
          <div className="home-ws-featured-collection__badges">
            {feature.level ? <Badge tone="blue">{feature.level}</Badge> : null}
            <Badge tone="neutral">
              {feature.textCount} text{feature.textCount === 1 ? "" : "s"}
            </Badge>
          </div>

          <h3 className="r3-title home-ws-featured-collection__title">{feature.name}</h3>
          <p className="r3-lead home-ws-featured-collection__description">{feature.description}</p>

          <div className="home-ws-featured-collection__stats">
            <p className="home-ws-featured-collection__stats-label">Path progress</p>
            <ul className="home-ws-featured-collection__stats-list">
              <li>{formatMetric(feature.wordsDiscovered)} words discovered</li>
              <li>{formatMetric(feature.conceptsExplored)} concepts explored</li>
              <li>{feature.averageReadingMinutes} min avg. reading</li>
            </ul>
          </div>

          <div className="home-ws-featured-collection__actions">
            <PrimaryButton href={feature.continueHref}>Continue path →</PrimaryButton>
            <GhostButton href={feature.viewHref}>View lessons</GhostButton>
          </div>

          <TextButton href="/library" className="home-ws-featured-collection__browse">
            See all paths →
          </TextButton>
        </div>
      </Card>
    </section>
  );
}
