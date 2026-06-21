import { getKnowledgeMetrics } from "@/features/admin";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { collocationPath } from "@/components/explorer/explorer-routes";

export default async function CollocationsBrowsePage() {
  const metrics = await getKnowledgeMetrics().catch(() => null);

  return (
    <CategoryBrowse
      featuredTitle="Collocations"
      searchPlaceholder="Rechercher une collocation…"
      featured={(metrics?.topCollocations ?? []).map((p) => ({
        label: p.label,
        href: collocationPath(p.label),
        meta: `${p.occurrenceCount}×`,
      }))}
    />
  );
}
