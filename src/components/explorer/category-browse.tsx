import { EmptyState, GhostButton } from "@/components/design-system";

import { BrowseList } from "./browse-list";
import { ExplorerLayout } from "./explorer-layout";
import { UniversalSearchPanel } from "./universal-search-panel";

type CategoryBrowseProps = {
  title: string;
  subtitle: string;
  breadcrumbLabel: string;
  featuredTitle: string;
  featured: Array<{ label: string; href: string; meta?: string }>;
  children?: React.ReactNode;
};

export function CategoryBrowse({
  title,
  subtitle,
  breadcrumbLabel,
  featuredTitle,
  featured,
  children,
}: CategoryBrowseProps) {
  return (
    <ExplorerLayout breadcrumb={[{ label: breadcrumbLabel }]} title={title} subtitle={subtitle}>
      <UniversalSearchPanel placeholder={`Rechercher dans ${breadcrumbLabel.toLowerCase()}…`} />
      {children}
      {featured.length > 0 ? (
        <BrowseList title={featuredTitle} items={featured} />
      ) : !children ? (
        <EmptyState
          title="Rien à afficher pour l'instant"
          description="Utilisez la recherche ci-dessus ou importez des textes pour enrichir cette catégorie."
          action={{ label: "Importer des textes", href: "/import" }}
        />
      ) : null}
      <div className="editorial-page-section pt-0">
        <GhostButton href="/explorer">← Retour à Explorer</GhostButton>
      </div>
    </ExplorerLayout>
  );
}
