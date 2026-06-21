import { getExpressionBrowseCards } from "@/features/explorer/get-explorer-browse-data";

import { CategoryBrowse } from "@/components/explorer/category-browse";

export default async function ExpressionsBrowsePage() {
  const cards = await getExpressionBrowseCards(12).catch(() => []);

  return <CategoryBrowse categoryId="expressions" cards={cards} />;
}
