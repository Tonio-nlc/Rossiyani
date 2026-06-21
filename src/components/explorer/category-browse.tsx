import type { ReactNode } from "react";

import { EmptyState } from "@/components/design-system";

import { ExplorerCompactList } from "./explorer-compact-list";
import { UniversalSearchPanel } from "./universal-search-panel";

type CategoryBrowseProps = {
  featuredTitle: string;
  featured: Array<{ label: string; href: string; meta?: string }>;
  children?: ReactNode;
  searchPlaceholder?: string;
};

export function CategoryBrowse({
  featuredTitle,
  featured,
  children,
  searchPlaceholder,
}: CategoryBrowseProps) {
  return (
    <div className="explorer-workspace-pane">
      <UniversalSearchPanel placeholder={searchPlaceholder} />
      {children}
      {featured.length > 0 ? (
        <ExplorerCompactList title={featuredTitle} items={featured} />
      ) : !children ? (
        <EmptyState
          title="Rien à afficher pour l'instant"
          description="Utilisez la recherche ci-dessus ou importez des textes pour enrichir cette catégorie."
          action={{ label: "Importer des textes", href: "/import" }}
        />
      ) : null}
    </div>
  );
}
