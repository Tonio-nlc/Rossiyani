import type { ExplorerGridItem } from "./explorer-editorial-grid";
import { ExplorerEditorialGrid } from "./explorer-editorial-grid";

type ExplorerDiscoveryGridProps = {
  items: Array<{ label: string; href: string; meta?: string; subtitle?: string }>;
};

export function ExplorerDiscoveryGrid({ items }: ExplorerDiscoveryGridProps) {
  const gridItems: ExplorerGridItem[] = items.map((item) => ({
    label: item.label,
    href: item.href,
    meta: item.meta,
    subtitle: item.subtitle,
  }));

  return <ExplorerEditorialGrid items={gridItems} />;
}
