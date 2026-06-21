import { CASE_LEGEND_ENTRIES } from "@/features/grammar/case-legend-data";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { casePath } from "@/components/explorer/explorer-routes";

export default function CasesBrowsePage() {
  return (
    <CategoryBrowse
      featuredTitle="Cas"
      searchPlaceholder="Rechercher un cas…"
      featured={CASE_LEGEND_ENTRIES.map((c) => ({
        label: c.frenchName,
        href: casePath(c.key),
        meta: c.shortLabel,
        subtitle: c.question,
      }))}
    />
  );
}
