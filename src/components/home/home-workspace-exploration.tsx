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
      layout: "large",
    },
    {
      href: "/explorer",
      title: "Explorer",
      description: "Follow lemmas, grammar patterns, and expressions.",
      Icon: HomeIconExplore,
      layout: "medium",
    },
    {
      href: "/manual",
      title: "Manual",
      description: "Reference lessons and methodology when you need depth.",
      Icon: HomeIconManual,
      layout: "medium",
    },
    {
      href: "/library?section=discoveries",
      title: "Saved Words",
      description:
        savedWordCount > 0
          ? `${savedWordCount} word${savedWordCount === 1 ? "" : "s"} marked while reading.`
          : "Mark words in the Reader to build your list.",
      Icon: HomeIconRead,
      layout: "small",
    },
    {
      href: "/explorer",
      title: "Recent Discoveries",
      description:
        explorationCount > 0
          ? `${explorationCount} exploration${explorationCount === 1 ? "" : "s"} in your history.`
          : "Exploration history appears as you study.",
      Icon: HomeIconExplore,
      layout: "small",
    },
  ];

  return (
    <section className="home-ws-section" aria-labelledby="home-ws-explore-heading">
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
                <span className="home-ws-explore-card__description">{card.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
