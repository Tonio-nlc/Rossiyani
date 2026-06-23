import Link from "next/link";

import type { HomeIconPractice } from "./home-icons";

export type ExplorationCardData = {
  href: string;
  title: string;
  metric: string;
  cta: string;
  Icon: typeof HomeIconPractice;
  layout: "large" | "medium" | "small";
};

type HomeWorkspaceExplorationProps = {
  cards: ExplorationCardData[];
};

export function HomeWorkspaceExploration({ cards }: HomeWorkspaceExplorationProps) {
  return (
    <section className="home-ws-section home-ws-section--quiet" aria-labelledby="home-ws-explore-heading">
      <div className="home-ws-section__head">
        <h2 id="home-ws-explore-heading" className="home-ws-section__title">
          Continue Your Exploration
        </h2>
      </div>

      <ul className="home-ws-explore-grid">
        {cards.map((card) => (
          <li
            key={card.title}
            className={[
              "home-ws-explore-grid__item",
              card.layout === "large" ? "home-ws-explore-grid__item--large" : "",
            ].join(" ")}
          >
            <Link
              href={card.href}
              className={[
                "home-ws-card",
                "home-ws-explore-card",
                `home-ws-explore-card--${card.layout}`,
                "focus-kb",
              ].join(" ")}
            >
              <span className="home-ws-explore-card__icon" aria-hidden>
                <card.Icon className="home-ws-explore-card__icon-svg" />
              </span>
              <span className="home-ws-explore-card__body">
                <span className="home-ws-explore-card__title">{card.title}</span>
                <span className="home-ws-explore-card__metric">{card.metric}</span>
                <span className="home-ws-explore-card__cta">{card.cta}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
