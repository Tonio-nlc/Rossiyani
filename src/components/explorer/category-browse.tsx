import type { ReactNode } from "react";

import type { ExplorerSidebarCategoryId } from "./explorer-sidebar-nav";
import type { ExplorerExploreCardData } from "./explorer-explore-card";
import { getExplorerCategory } from "./explorer-categories";
import { ExplorerCategoryEmpty } from "./explorer-category-empty";
import { ExplorerCategoryHeader } from "./explorer-category-header";
import { ExplorerExploreGrid } from "./explorer-explore-grid";

type CategoryBrowseProps = {
  categoryId: ExplorerSidebarCategoryId;
  cards: ExplorerExploreCardData[];
  children?: ReactNode;
  /** Grid section title when cards exist — defaults to "From your texts". */
  gridTitle?: string;
};

export function CategoryBrowse({
  categoryId,
  cards,
  children,
  gridTitle = "From your texts",
}: CategoryBrowseProps) {
  const category = getExplorerCategory(categoryId);
  const hasContent = cards.length > 0;

  return (
    <div className="explorer-workspace-pane explorer-workspace-pane--category">
      <ExplorerCategoryHeader category={category} />
      {children}
      {hasContent ? (
        <ExplorerExploreGrid title={gridTitle} cards={cards} />
      ) : (
        <ExplorerCategoryEmpty />
      )}
    </div>
  );
}
