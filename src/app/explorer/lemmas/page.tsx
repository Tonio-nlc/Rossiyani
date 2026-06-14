import { getKnowledgeMetrics } from "@/features/admin";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { lemmaPath } from "@/components/explorer/explorer-routes";

export default async function LemmasBrowsePage() {
  const metrics = await getKnowledgeMetrics().catch(() => null);

  return (
    <CategoryBrowse
      title="Vocabulary"
      subtitle="Words you've encountered — each one a doorway to constructions, texts, and practice."
      breadcrumbLabel="Lemmes"
      featuredTitle="Frequently used"
      featured={(metrics?.topLemmas ?? []).map((l) => ({
        label: l.lemma,
        href: lemmaPath(l.lemma, "noun"),
        meta: `${l.occurrenceCount}×`,
      }))}
    />
  );
}
