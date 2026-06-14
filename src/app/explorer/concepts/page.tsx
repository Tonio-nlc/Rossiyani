import { getKnowledgeMetrics } from "@/features/admin";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { conceptPath } from "@/components/explorer/explorer-routes";

export default async function ConceptsBrowsePage() {
  const metrics = await getKnowledgeMetrics().catch(() => null);

  return (
    <CategoryBrowse
      title="Grammar patterns"
      subtitle="Living patterns from your texts — constructions, cases, and how Russian actually works."
      breadcrumbLabel="Concepts"
      featuredTitle="Popular"
      featured={(metrics?.topConcepts ?? []).map((c) => ({
        label: c.title,
        href: conceptPath(c.title),
        meta: `${c.hitCount}×`,
      }))}
    />
  );
}
