import Link from "next/link";

import {
  HomeIconExplore,
  HomeIconManual,
  HomeIconPractice,
  HomeIconRead,
} from "./home-icons";

type HomeWorkspaceExplorationProps = {
  savedWordCount: number;
  explorationCount: number;
};

type ExploreCard = {
  href: string;
  title: string;
  description: string;
  Icon: typeof HomeIconPractice;
  accent: string;
  layout: "large" | "medium" | "small";
};

export function HomeWorkspaceExploration({
  savedWordCount,
  explorationCount,
}: HomeWorkspaceExplorationProps) {
  const cards: ExploreCard[] = [
    {
      href: "/practice",
      title: "Practice",
      description: "Compose sentences from structures you meet in reading.",
      Icon: HomeIconPractice,
      accent: "practice",
      layout: "large",
    },
    {
      href: "/explorer",
      title: "Explorer",
      description: "Follow lemmas, grammar patterns, and expressions.",
      Icon: HomeIconExplore,
      accent: "explorer",
      layout: "medium",
    },
    {
      href: "/manual",
      title: "Manual",
      description: "Reference lessons and methodology when you need depth.",
      Icon: HomeIconManual,
      accent: "manual",
      layout: "medium",
    },
    {
      href: "/library?section=discoveries",
      title: "Saved words",
      description:
        savedWordCount > 0
          ? `${savedWordCount} word${savedWordCount === 1 ? "" : "s"} marked while reading.`
          : "Mark words in the Reader to build your list.",
      Icon: HomeIconRead,
      accent: "saved",
      layout: "small",
    },
    {
      href: "/explorer",
      title: "Recent discoveries",
      description:
        explorationCount > 0
          ? `${explorationCount} exploration${explorationCount === 1 ? "" : "s"} in your history.`
          : "Exploration history appears as you study.",
      Icon: HomeIconExplore,
      accent: "discoveries",
      layout: "small",
    },
  ];

  return (
    <section className="home-ws-section home-ws-section--surface-cream" aria-labelledby="home-ws-explore-heading">
      <div className="home-ws-section__head">
        <h2 id="home-ws-explore-heading" className="home-ws-section__title">
          Continue your exploration
        </h2>
      </div>

      <ul className="home-ws-explore-grid">
        {cards.map((card) => (
          <li
            key={card.title}
            className={[
              "home-ws-explore-grid__item",
              `home-ws-explore-grid__item--${card.layout}`,
            ].join(" ")}
          >
            <Link
              href={card.href}
              className={[
                "home-ws-card",
                "home-ws-explore-card",
                `home-ws-explore-card--${card.accent}`,
                `home-ws-explore-card--${card.layout}`,
                "focus-kb",
              ].join(" ")}
            >
              <span className="home-ws-explore-card__icon" aria-hidden>
                <card.Icon className="home-ws-explore-card__icon-svg" />
              </span>
              <span className="home-ws-explore-card__body">
                <span className="home-ws-explore-card__title">{card.title}</span>
                <span className="home-ws-explore-card__description">{card.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
