import { getConceptBrowseCards } from "@/features/explorer/get-explorer-browse-data";

import { CategoryBrowse } from "@/components/explorer/category-browse";

export default async function ConceptsBrowsePage() {
  const cards = await getConceptBrowseCards(12).catch(() => []);

  return (
    <CategoryBrowse
      title="Concepts grammaticaux"
      searchPlaceholder="Rechercher un concept…"
      cards={cards}
    />
  );
}
