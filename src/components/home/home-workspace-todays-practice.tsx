import Link from "next/link";

import type { TodaysPracticeCard } from "@/lib/home/build-todays-practice";

type HomeWorkspaceTodaysPracticeProps = {
  cards: TodaysPracticeCard[];
};

export function HomeWorkspaceTodaysPractice({ cards }: HomeWorkspaceTodaysPracticeProps) {
  return (
    <section className="home-ws-section home-ws-section--surface-cream" aria-labelledby="home-ws-practice-heading">
      <div className="home-ws-section__head">
        <h2 id="home-ws-practice-heading" className="home-ws-section__title">
          Today&apos;s Practice
        </h2>
      </div>

      <ul className="home-ws-practice-grid">
        {cards.map((card) => (
          <li key={card.id}>
            <Link
              href={card.href}
              className={[
                "home-ws-card",
                "home-ws-practice-card",
                `home-ws-practice-card--${card.id}`,
                "focus-kb",
              ].join(" ")}
            >
              <h3 className="home-ws-practice-card__title">{card.title}</h3>
              <p className="home-ws-practice-card__description">{card.description}</p>
              <p className="home-ws-practice-card__progress">{card.progressLabel}</p>
              <span className="home-ws-practice-card__cta">{card.cta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
