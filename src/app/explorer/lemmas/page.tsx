import { getKnowledgeMetrics } from "@/features/admin";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { lemmaPath } from "@/components/explorer/explorer-routes";

export default async function LemmasBrowsePage() {
  const metrics = await getKnowledgeMetrics().catch(() => null);

  return (
    <CategoryBrowse
      title="Lemmes"
      subtitle="Dictionnaire cumulatif — toutes les entrées lexicales du graphe de connaissances."
      breadcrumbLabel="Lemmes"
      featuredTitle="Lemmes les plus fréquents"
      featured={(metrics?.topLemmas ?? []).map((l) => ({
        label: l.lemma,
        href: lemmaPath(l.lemma, "noun"),
        meta: `${l.occurrenceCount}×`,
      }))}
    />
  );
}
