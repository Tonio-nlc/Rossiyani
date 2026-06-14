import { getKnowledgeMetrics } from "@/features/admin";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { endingPath } from "@/components/explorer/explorer-routes";

export default async function EndingsBrowsePage() {
  const metrics = await getKnowledgeMetrics().catch(() => null);

  return (
    <CategoryBrowse
      title="Word endings"
      subtitle="Reusable endings — the visual heart of Russian morphology."
      breadcrumbLabel="Terminaisons"
      featuredTitle="Popular"
      featured={(metrics?.topEndings ?? []).map((e) => ({
        label: `-${e.ending}`,
        href: endingPath(e.ending),
        meta: `${e.hitCount}×`,
      }))}
    />
  );
}
