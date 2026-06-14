import Link from "next/link";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { BrowseList } from "./browse-list";
import { ExplorerLayout } from "./explorer-layout";
import { UniversalSearchPanel } from "./universal-search-panel";

type CategoryBrowseProps = {
  title: string;
  subtitle: string;
  breadcrumbLabel: string;
  featuredTitle: string;
  featured: Array<{ label: string; href: string; meta?: string }>;
  children?: ReactNode;
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
          icon="🔎"
          title="Rien à afficher pour l'instant"
          description="Utilisez la recherche ci-dessus ou importez des textes pour enrichir cette catégorie."
          action={{ label: "Importer des textes", href: "/import" }}
        />
      ) : null}
      <p className="text-sm text-[var(--ink-muted)]">
        <Link href="/explorer" className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline">
          ← Back to Explorer
        </Link>
      </p>
    </ExplorerLayout>
  );
}
