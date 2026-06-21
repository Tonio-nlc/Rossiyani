import { CategoryBrowse } from "@/components/explorer/category-browse";

export default function ExpressionsBrowsePage() {
  return (
    <CategoryBrowse
      title="Expressions"
      searchPlaceholder="Rechercher une expression…"
      cards={[]}
    >
      <p className="explorer-workspace-pane__hint">
        Recherchez une expression par libellé russe ou français. Les résultats mènent vers une fiche
        détaillée dans cet espace de travail.
      </p>
    </CategoryBrowse>
  );
}
