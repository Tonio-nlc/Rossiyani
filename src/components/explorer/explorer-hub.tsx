import Link from "next/link";

import { GhostButton } from "@/components/design-system";
import type { TodaysDiscovery } from "@/features/discovery/types";
import { categoryPortalCards } from "@/components/explorer/explorer-categories";
import type { LemmaBrowseCard } from "@/features/explorer/get-explorer-browse-data";

import { ExplorerExploreGrid } from "./explorer-explore-grid";
import { ExplorerHubIntro } from "./explorer-hub-intro";
import { ExplorerHubRecent } from "./explorer-hub-recent";
import { ExplorerSearchPanel } from "./explorer-search-panel";

type ExplorerHubProps = {
  isEmpty: boolean;
  frequentLemmas: LemmaBrowseCard[];
  discovery: TodaysDiscovery | null;
};

export function ExplorerHub({ isEmpty, frequentLemmas, discovery }: ExplorerHubProps) {
  const frequentCards = frequentLemmas.slice(0, 6);

  return (
    <div className="explorer-workspace-pane explorer-workspace-pane--hub">
      <ExplorerHubIntro />
      <ExplorerSearchPanel autoFocus={!isEmpty} compact />

      <ExplorerExploreGrid title="What can you discover?" cards={categoryPortalCards()} />

      {!isEmpty ? (
        <>
          <ExplorerHubRecent />

          {frequentCards.length > 0 ? (
            <ExplorerExploreGrid title="Most frequent observations" cards={frequentCards} />
          ) : null}

          {discovery ? (
            <section className="explorer-explore-grid-block">
              <h2 className="explorer-explore-grid-block__title">Discovery of the day</h2>
              <Link
                href={discovery.explorerHref}
                className="explorer-explore-card explorer-explore-card--discovery focus-kb"
              >
                <div className="explorer-explore-card__body">
                  <p className="explorer-explore-card__title break-russian">
                    {discovery.displayLabel}
                  </p>
                  <p className="explorer-explore-card__description">{discovery.subtitle}</p>
                  {discovery.exampleRussian ? (
                    <p className="explorer-explore-card__preview break-russian font-reader">
                      {discovery.exampleRussian}
                    </p>
                  ) : null}
                </div>
                <span className="explorer-explore-card__cta">Open →</span>
              </Link>
            </section>
          ) : null}
        </>
      ) : (
        <div className="explorer-workspace-pane__empty">
          <GhostButton href="/import">Import texts →</GhostButton>
        </div>
      )}
    </div>
  );
}
