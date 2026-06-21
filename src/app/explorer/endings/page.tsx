import { getEndingBrowseCards } from "@/features/explorer/get-explorer-browse-data";

import { CategoryBrowse } from "@/components/explorer/category-browse";

export default async function EndingsBrowsePage() {
  const cards = await getEndingBrowseCards(12).catch(() => []);

  return <CategoryBrowse categoryId="endings" cards={cards} />;
}
