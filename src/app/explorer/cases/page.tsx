import { CASE_LEGEND_ENTRIES } from "@/features/grammar/case-legend-data";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { ExplorerEditorialGrid } from "@/components/explorer/explorer-editorial-grid";
import { casePath } from "@/components/explorer/explorer-routes";

export default function CasesBrowsePage() {
  return (
    <CategoryBrowse
      title="Les cas russes"
      subtitle="Les six cas (+ locatif) — questions, terminaisons typiques et contrastes avec le français."
      breadcrumbLabel="Cas"
      featuredTitle="À retenir"
      featured={CASE_LEGEND_ENTRIES.map((c) => ({
        label: c.frenchName,
        href: casePath(c.key),
        meta: c.question,
      }))}
    >
      <section className="editorial-page-section space-y-4 pb-0">
        <p className="text-eyebrow">Index des cas</p>
        <ExplorerEditorialGrid
          items={CASE_LEGEND_ENTRIES.map((c) => ({
            label: c.frenchName,
            href: casePath(c.key),
            subtitle: c.question,
            meta: c.shortLabel,
          }))}
        />
      </section>
    </CategoryBrowse>
  );
}
