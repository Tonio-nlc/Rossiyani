import { Badge, Card } from "@/components/design-system";
import type { TodaysPracticeCard } from "@/lib/home/build-todays-practice";

type HomeWorkspaceTodaysPracticeProps = {
  cards: TodaysPracticeCard[];
};

export function HomeWorkspaceTodaysPractice({ cards }: HomeWorkspaceTodaysPracticeProps) {
  return (
    <section className="lessons-section" aria-labelledby="home-ws-practice-heading">
      <div className="lessons-section__head">
        <div>
          <h2 id="home-ws-practice-heading" className="r3-title lessons-section__title">
            Aujourd&apos;hui
          </h2>
          <p className="r3-lead lessons-section__subtitle">
            Trois exercices courts pour garder le rythme.
          </p>
        </div>
      </div>

      <div className="lessons-grid lessons-grid--lessons ws-card-grid ws-card-grid--items">
        {cards.map((card) => (
          <div key={card.id} className="ws-card-grid__cell">
            <Card href={card.href} className="lessons-lesson-card ws-card">
              <div className="ws-card__body">
                <h3 className="r3-title ws-card__title lessons-lesson-card__title">{card.title}</h3>
                <p className="r3-lead ws-card__desc lessons-lesson-card__desc">{card.description}</p>
              </div>
              <div className="ws-card__meta lessons-lesson-card__meta">
                <Badge tone="neutral">{card.progressLabel}</Badge>
              </div>
              <footer className="ws-card__footer">
                <span className="lessons-lesson-card__cta">{card.cta}</span>
              </footer>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
