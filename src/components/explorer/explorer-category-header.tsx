import type { ExplorerCategoryMeta } from "./explorer-categories";

type ExplorerCategoryHeaderProps = {
  category: ExplorerCategoryMeta;
};

export function ExplorerCategoryHeader({ category }: ExplorerCategoryHeaderProps) {
  return (
    <header className="explorer-category-header">
      <h1 className="explorer-category-header__title">{category.label}</h1>
      <p className="explorer-category-header__mission">{category.mission}</p>
    </header>
  );
}
