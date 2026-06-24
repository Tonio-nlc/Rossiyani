import Link from "next/link";

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
    <section className="home-ws-section home-ws-section--tone-cool" aria-labelledby="home-ws-reading-heading">
      <div className="home-ws-section__head">
        <h2 id="home-ws-reading-heading" className="home-ws-section__title">
          Recommended Reading
        </h2>
        <p className="home-ws-section__subtitle">
          Based on your current level and activity.
        </p>
      </div>

      <ul className="home-ws-reading-grid">
        {texts.map((text) => (
          <li key={text.id}>
            <article className="home-ws-card home-ws-reading-card">
              <div className="home-ws-reading-card__media">
                <HomeReadingCover collectionId={text.collectionId} className="home-ws-reading-card__cover" />
                <div className="home-ws-reading-card__badges">
                  <span className="home-ws-badge">{text.level}</span>
                  <span className="home-ws-badge home-ws-badge--muted">{text.estimatedMinutes} min</span>
                </div>
              </div>
              <div className="home-ws-reading-card__body">
                <h3 className="home-ws-reading-card__title break-russian">{text.title}</h3>
                <p className="home-ws-reading-card__description">{text.description}</p>
                <Link href={text.href} className="home-ws-btn home-ws-reading-card__cta focus-kb">
                  Start Reading →
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
