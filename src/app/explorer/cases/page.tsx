import { getCaseBrowseCards } from "@/features/explorer/get-explorer-browse-data";

import { CategoryBrowse } from "@/components/explorer/category-browse";

export default async function CasesBrowsePage() {
  const cards = await getCaseBrowseCards().catch(() => []);

  return (
    <CategoryBrowse title="Les six cas" searchPlaceholder="Rechercher un cas…" cards={cards} />
  );
}
