import { CategoryBrowse } from "@/components/explorer/category-browse";

export default function ExpressionsBrowsePage() {
  return (
    <CategoryBrowse
      featuredTitle="Expressions"
      searchPlaceholder="Rechercher une expression…"
      featured={[]}
    >
      <p className="explorer-workspace-pane__hint">
        Recherchez une expression par libellé russe ou français. Les résultats de type expression
        mènent vers une fiche détaillée.
      </p>
    </CategoryBrowse>
  );
}
