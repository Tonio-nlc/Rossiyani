import Link from "next/link";

import {
  HomeIconExplore,
  HomeIconManual,
  HomeIconPractice,
  HomeIconRead,
} from "./home-icons";

type HomeWorkspaceExplorationProps = {
  savedWordCount: number;
  discoveryCount: number;
};

const BASE_CARDS = [
  {
    href: "/practice",
    title: "Practice",
    description: "Compose sentences from structures you meet in reading.",
    Icon: HomeIconPractice,
    accent: "practice",
  },
  {
    href: "/explorer",
    title: "Explorer",
    description: "Follow lemmas, grammar patterns, and expressions.",
    Icon: HomeIconExplore,
    accent: "explorer",
  },
  {
    href: "/manual",
    title: "Manual",
    description: "Reference lessons and methodology when you need depth.",
    Icon: HomeIconManual,
    accent: "manual",
  },
] as const;

export function HomeWorkspaceExploration({
  savedWordCount,
  discoveryCount,
}: HomeWorkspaceExplorationProps) {
  const cards = [
    ...BASE_CARDS,
    {
      href: "/library?section=discoveries",
      title: "Saved words",
      description:
        savedWordCount > 0
          ? `${savedWordCount} word${savedWordCount === 1 ? "" : "s"} marked while reading.`
          : "Mark words in the Reader to build your list.",
      Icon: HomeIconRead,
      accent: "saved",
    },
    {
      href: "/explorer",
      title: "Recent discoveries",
      description:
        discoveryCount > 0
          ? `${discoveryCount} recent concept${discoveryCount === 1 ? "" : "s"} waiting to revisit.`
          : "Exploration history appears as you study.",
      Icon: HomeIconExplore,
      accent: "discoveries",
    },
  ];

  return (
    <section className="home-ws-section" aria-labelledby="home-ws-explore-heading">
      <div className="home-ws-section__head">
        <h2 id="home-ws-explore-heading" className="home-ws-section__title">
          Continue your exploration
        </h2>
      </div>

      <ul className="home-ws-explore-grid">
        {cards.map((card) => (
          <li key={card.title}>
            <Link
              href={card.href}
              className={[
                "home-ws-card",
                "home-ws-explore-card",
                `home-ws-explore-card--${card.accent}`,
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
