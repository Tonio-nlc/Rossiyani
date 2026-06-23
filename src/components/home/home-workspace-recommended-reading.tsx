import { PrimaryButton } from "@/components/design-system";
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
        <h2 id="home-ws-reading-heading" className="home-ws-section__title">
          Recommended reading
        </h2>
      </div>

      <ul className="home-ws-reading-grid">
        {texts.map((text) => (
          <li key={text.id}>
            <article className="home-ws-card home-ws-reading-card">
              <HomeReadingCover collectionId={text.collectionId} className="home-ws-reading-card__cover" />
              <div className="home-ws-reading-card__body">
                <p className="home-ws-reading-card__meta">
                  {text.collection} · {text.level} · {text.estimatedMinutes} min
                </p>
                <h3 className="home-ws-reading-card__title break-russian">{text.title}</h3>
                <PrimaryButton href={text.href} className="home-ws-reading-card__cta">
                  Start Reading
                </PrimaryButton>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
