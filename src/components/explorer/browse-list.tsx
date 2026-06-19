import type { ExplorerGridItem } from "./explorer-editorial-grid";
import { ExplorerEditorialGrid } from "./explorer-editorial-grid";

type BrowseListItem = {
  label: string;
  href: string;
  meta?: string;
};

type BrowseListProps = {
  title: string;
  items: BrowseListItem[];
};

export function BrowseList({ title, items }: BrowseListProps) {
  if (items.length === 0) {
    return null;
  }

  const gridItems: ExplorerGridItem[] = items.map((item) => ({
    label: item.label,
    href: item.href,
    meta: item.meta,
  }));

  return (
    <section className="space-y-4">
      <p className="text-eyebrow">{title}</p>
      <ExplorerEditorialGrid items={gridItems} />
    </section>
  );
}
