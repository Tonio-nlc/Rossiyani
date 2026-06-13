import { getKnowledgeMetrics } from "@/features/admin";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { endingPath } from "@/components/explorer/explorer-routes";

export default async function EndingsBrowsePage() {
  const metrics = await getKnowledgeMetrics().catch(() => null);

  return (
    <CategoryBrowse
      title="Terminaisons"
      subtitle="Terminaisons réutilisables — l'élément visuel central de la morphologie russe."
      breadcrumbLabel="Terminaisons"
      featuredTitle="Terminaisons les plus fréquentes"
      featured={(metrics?.topEndings ?? []).map((e) => ({
        label: `-${e.ending}`,
        href: endingPath(e.ending),
        meta: `${e.hitCount}×`,
      }))}
    />
  );
}
