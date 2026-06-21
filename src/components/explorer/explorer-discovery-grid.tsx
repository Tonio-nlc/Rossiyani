import type { ExplorerGridItem } from "./explorer-editorial-grid";
import { ExplorerCompactList } from "./explorer-compact-list";

type ExplorerDiscoveryGridProps = {
  items: Array<{ label: string; href: string; meta?: string; subtitle?: string }>;
};

export function ExplorerDiscoveryGrid({ items }: ExplorerDiscoveryGridProps) {
  const compactItems = items.map((item) => ({
    label: item.label,
    href: item.href,
    meta: item.meta,
    subtitle: item.subtitle,
  }));

  return <ExplorerCompactList items={compactItems} />;
}

export type { ExplorerGridItem };
