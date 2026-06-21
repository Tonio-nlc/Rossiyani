import type { ExplorerCompactItem } from "./explorer-compact-list";
import { ExplorerCompactList } from "./explorer-compact-list";

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
  const compactItems: ExplorerCompactItem[] = items.map((item) => ({
    label: item.label,
    href: item.href,
    meta: item.meta,
  }));

  return <ExplorerCompactList title={title} items={compactItems} />;
}
