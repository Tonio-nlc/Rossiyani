import { getKnowledgeMetrics } from "@/features/admin";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { endingPath } from "@/components/explorer/explorer-routes";

export default async function EndingsBrowsePage() {
  const metrics = await getKnowledgeMetrics().catch(() => null);

  return (
    <CategoryBrowse
      featuredTitle="Terminaisons"
      searchPlaceholder="Rechercher une terminaison…"
      featured={(metrics?.topEndings ?? []).map((e) => ({
        label: `-${e.ending}`,
        href: endingPath(e.ending),
        meta: `${e.hitCount}×`,
      }))}
    />
  );
}
