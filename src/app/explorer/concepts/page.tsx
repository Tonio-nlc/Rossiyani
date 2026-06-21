import { getConceptBrowseCards } from "@/features/explorer/get-explorer-browse-data";

import { CategoryBrowse } from "@/components/explorer/category-browse";

export default async function ConceptsBrowsePage() {
  const cards = await getConceptBrowseCards(12).catch(() => []);

  return <CategoryBrowse categoryId="concepts" cards={cards} />;
}
