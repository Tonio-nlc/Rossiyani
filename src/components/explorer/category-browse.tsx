import type { ReactNode } from "react";

import type { ExplorerExploreCardData } from "./explorer-explore-card";
import { ExplorerExploreGrid } from "./explorer-explore-grid";
import { UniversalSearchPanel } from "./universal-search-panel";

type CategoryBrowseProps = {
  title?: string;
  cards: ExplorerExploreCardData[];
  children?: ReactNode;
  searchPlaceholder?: string;
};

export function CategoryBrowse({
  title,
  cards,
  children,
  searchPlaceholder,
}: CategoryBrowseProps) {
  return (
    <div className="explorer-workspace-pane">
      <UniversalSearchPanel placeholder={searchPlaceholder} />
      {children}
      <ExplorerExploreGrid title={title} cards={cards} />
    </div>
  );
}
