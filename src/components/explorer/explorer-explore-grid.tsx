import type { ReactNode } from "react";

import type { ExplorerExploreCardData } from "./explorer-explore-card";
import { ExplorerExploreCard } from "./explorer-explore-card";

type ExplorerExploreGridProps = {
  title?: string;
  cards: ExplorerExploreCardData[];
  children?: ReactNode;
};

function exploreCardKey(card: ExplorerExploreCardData): string {
  if (card.kind === "lemma") {
    return `${card.kind}-${card.href}-${card.lemma}`;
  }
  return `${card.kind}-${card.href}-${card.title}`;
}

export function ExplorerExploreGrid({ title, cards, children }: ExplorerExploreGridProps) {
  if (cards.length === 0 && !children) {
    return null;
  }

  return (
    <section className="explorer-explore-grid-block">
      {title ? <h2 className="explorer-explore-grid-block__title">{title}</h2> : null}
      {children}
      {cards.length > 0 ? (
        <div className="explorer-explore-grid">
          {cards.map((card) => (
            <ExplorerExploreCard
              key={exploreCardKey(card)}
              card={card}
              featured={card.kind === "case"}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
