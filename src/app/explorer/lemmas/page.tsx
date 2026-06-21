import { getKnowledgeMetrics } from "@/features/admin";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { lemmaPath } from "@/components/explorer/explorer-routes";

export default async function LemmasBrowsePage() {
  const metrics = await getKnowledgeMetrics().catch(() => null);

  return (
    <CategoryBrowse
      featuredTitle="Lemmes fréquents"
      searchPlaceholder="Rechercher un lemme…"
      featured={(metrics?.topLemmas ?? []).map((l) => ({
        label: l.lemma,
        href: lemmaPath(l.lemma, "noun"),
        meta: `${l.occurrenceCount}×`,
      }))}
    />
  );
}
