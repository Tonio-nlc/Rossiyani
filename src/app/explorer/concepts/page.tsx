import { getKnowledgeMetrics } from "@/features/admin";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { conceptPath } from "@/components/explorer/explorer-routes";

export default async function ConceptsBrowsePage() {
  const metrics = await getKnowledgeMetrics().catch(() => null);

  return (
    <CategoryBrowse
      featuredTitle="Concepts"
      searchPlaceholder="Rechercher un concept…"
      featured={(metrics?.topConcepts ?? []).map((c) => ({
        label: c.title,
        href: conceptPath(c.title),
        meta: `${c.hitCount}×`,
      }))}
    />
  );
}
