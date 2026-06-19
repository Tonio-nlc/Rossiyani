import type { ExplorerGridItem } from "./explorer-editorial-grid";
import { ExplorerEditorialGrid } from "./explorer-editorial-grid";

type RelatedChip = {
  label: string;
  href: string;
  kind?: string;
};

type RelatedNavigationProps = {
  items: RelatedChip[];
  title?: string;
};

export function RelatedNavigation({ items, title = "Mots et notions liés" }: RelatedNavigationProps) {
  if (items.length === 0) {
    return null;
  }

  const unique = items.filter(
    (item, index, array) => array.findIndex((candidate) => candidate.href === item.href) === index,
  );

  const gridItems: ExplorerGridItem[] = unique.map((item) => ({
    label: item.label,
    href: item.href,
    meta: item.kind,
  }));

  return (
    <section className="editorial-page-section space-y-4">
      <p className="text-eyebrow">{title}</p>
      <ExplorerEditorialGrid items={gridItems} />
    </section>
  );
}

export { conceptChip, lemmaChip, endingChip, caseChip, expressionChip, collocationChip, textChip, lessonChip } from "./related-navigation-chips";
