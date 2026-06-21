import { getCollocationBrowseCards } from "@/features/explorer/get-explorer-browse-data";

import { CategoryBrowse } from "@/components/explorer/category-browse";

export default async function CollocationsBrowsePage() {
  const cards = await getCollocationBrowseCards(12).catch(() => []);

  return (
    <CategoryBrowse
      title="Collocations"
      searchPlaceholder="Rechercher une collocation…"
      cards={cards}
    />
  );
}
