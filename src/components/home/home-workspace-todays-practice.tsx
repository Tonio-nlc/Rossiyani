import { Card } from "@/components/design-system";
import type { TodaysPracticeCard } from "@/lib/home/build-todays-practice";

type HomeWorkspaceTodaysPracticeProps = {
  cards: TodaysPracticeCard[];
};

export function HomeWorkspaceTodaysPractice({ cards }: HomeWorkspaceTodaysPracticeProps) {
  return (
    <section className="home-ws-section" aria-labelledby="home-ws-practice-heading">
      <div className="home-ws-section__head">
        <h2 id="home-ws-practice-heading" className="r3-title home-ws-section__title">
          Today&apos;s practice
        </h2>
        <p className="r3-lead home-ws-section__subtitle">
          Quick drills to build momentum today.
        </p>
      </div>

      <ul className="home-ws-practice-grid">
        {cards.map((card) => (
          <li key={card.id}>
            <Card
              href={card.href}
              className={["home-ws-practice-card", `home-ws-practice-card--${card.id}`].join(" ")}
            >
              <h3 className="r3-title home-ws-practice-card__title">{card.title}</h3>
              <p className="r3-lead home-ws-practice-card__description">{card.description}</p>
              <p className="home-ws-practice-card__progress">{card.progressLabel}</p>
              <span className="home-ws-practice-card__cta">{card.cta}</span>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
