import { CategoryBrowse } from "@/components/explorer/category-browse";

export default function ExpressionsBrowsePage() {
  return (
    <CategoryBrowse
      title="Expressions"
      subtitle="Expressions figées et constructions natives — recherchez par label russe ou français."
      breadcrumbLabel="Expressions"
      featuredTitle="À découvrir"
      featured={[]}
    >
      <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm text-[var(--muted)]">
        Utilisez la recherche ci-dessus pour trouver une expression. Les résultats de type{" "}
        <strong className="text-[var(--foreground)]">FIXED_EXPRESSION</strong> et{" "}
        <strong className="text-[var(--foreground)]">NATIVE_CONSTRUCTION</strong> mènent ici.
      </p>
    </CategoryBrowse>
  );
}
