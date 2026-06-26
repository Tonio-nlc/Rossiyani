import { Badge, Card, PrimaryButton } from "@/components/design-system";
import type { RecommendedTextCard } from "@/lib/home/pick-recommended-texts";

import { HomeReadingCover } from "./home-reading-cover";

type HomeWorkspaceRecommendedReadingProps = {
  texts: RecommendedTextCard[];
};

export function HomeWorkspaceRecommendedReading({ texts }: HomeWorkspaceRecommendedReadingProps) {
  if (texts.length === 0) {
    return null;
  }

  return (
    <section className="home-ws-section" aria-labelledby="home-ws-reading-heading">
      <div className="home-ws-section__head">
        <h2 id="home-ws-reading-heading" className="r3-title home-ws-section__title">
          Recent activity
        </h2>
        <p className="r3-lead home-ws-section__subtitle">
          Picked for your level and reading history.
        </p>
      </div>

      <ul className="home-ws-reading-grid">
        {texts.map((text) => (
          <li key={text.id}>
            <Card as="article" interactive className="home-ws-reading-card">
              <div className="home-ws-reading-card__media">
                <HomeReadingCover collectionId={text.collectionId} className="home-ws-reading-card__cover" />
                <div className="home-ws-reading-card__badges">
                  <Badge tone="blue">{text.level}</Badge>
                  <Badge tone="neutral">{text.estimatedMinutes} min</Badge>
                </div>
              </div>
              <div className="home-ws-reading-card__body">
                <h3 className="r3-title home-ws-reading-card__title break-russian">{text.title}</h3>
                <p className="r3-lead home-ws-reading-card__description">{text.description}</p>
                <PrimaryButton href={text.href} className="home-ws-reading-card__cta">
                  Start lesson →
                </PrimaryButton>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
