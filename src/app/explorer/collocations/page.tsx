import { getKnowledgeMetrics } from "@/features/admin";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { collocationPath } from "@/components/explorer/explorer-routes";

export default async function CollocationsBrowsePage() {
  const metrics = await getKnowledgeMetrics().catch(() => null);

  return (
    <CategoryBrowse
      title="Native constructions"
      subtitle="What sounds natural in Russian — frequent word pairings from your texts."
      breadcrumbLabel="Collocations"
      featuredTitle="Popular"
      featured={(metrics?.topCollocations ?? []).map((p) => ({
        label: p.label,
        href: collocationPath(p.label),
        meta: `${p.occurrenceCount}×`,
      }))}
    />
  );
}
