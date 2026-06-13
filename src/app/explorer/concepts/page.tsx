import { getKnowledgeMetrics } from "@/features/admin";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { conceptPath } from "@/components/explorer/explorer-routes";

export default async function ConceptsBrowsePage() {
  const metrics = await getKnowledgeMetrics().catch(() => null);

  return (
    <CategoryBrowse
      title="Concepts"
      subtitle="Patterns grammaticaux, cas, constructions — le cœur pédagogique du graphe."
      breadcrumbLabel="Concepts"
      featuredTitle="Concepts les plus fréquents"
      featured={(metrics?.topConcepts ?? []).map((c) => ({
        label: c.title,
        href: conceptPath(c.title),
        meta: `${c.hitCount}×`,
      }))}
    />
  );
}
