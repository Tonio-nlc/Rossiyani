import Link from "next/link";

import { CASE_LEGEND_ENTRIES } from "@/features/grammar/case-legend-data";

import { CategoryBrowse } from "@/components/explorer/category-browse";
import { casePath } from "@/components/explorer/explorer-routes";

export default function CasesBrowsePage() {
  return (
    <CategoryBrowse
      title="Russian cases"
      subtitle="The six cases (+ locative) — questions, typical endings, and contrasts with French."
      breadcrumbLabel="Cas"
      featuredTitle="Featured"
      featured={CASE_LEGEND_ENTRIES.map((c) => ({
        label: c.frenchName,
        href: casePath(c.key),
        meta: c.question,
      }))}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CASE_LEGEND_ENTRIES.map((c) => (
          <Link
            key={c.key}
            href={casePath(c.key)}
            className="focus-kb card-hover surface-elevated rounded-2xl border border-[var(--border)] p-5 transition"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-violet-bright)]">
              {c.shortLabel}
            </p>
            <p className="mt-2 text-lg font-semibold">{c.frenchName}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{c.question}</p>
          </Link>
        ))}
      </div>
    </CategoryBrowse>
  );
}
