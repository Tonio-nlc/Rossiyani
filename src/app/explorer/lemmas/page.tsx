import { getLemmaBrowseCards } from "@/features/explorer/get-explorer-browse-data";

import { CategoryBrowse } from "@/components/explorer/category-browse";

export default async function LemmasBrowsePage() {
  const cards = await getLemmaBrowseCards(12).catch(() => []);

  return (
    <CategoryBrowse
      title="Lemmes fréquents"
      searchPlaceholder="Rechercher un lemme…"
      cards={cards}
    />
  );
}
