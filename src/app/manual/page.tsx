import { ManualCategoryGrid, ManualLevelGrid } from "@/components/manual";
import { getManualStats } from "@/features/manual";

export default function ManualPage() {
  const stats = getManualStats();

  return (
    <div className="pb-16">
      <header className="mb-10 space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          Manual
        </p>
        <p className="max-w-2xl text-sm leading-snug text-[var(--ink-secondary)]">
          Grammaire, vocabulaire, prononciation et usage natif.
        </p>
        <p className="text-sm text-[var(--ink-muted)]">Explorez par niveau ou par thème.</p>
      </header>

      <section className="mb-20 space-y-4">
        <h2 className="font-reader text-lg font-semibold text-[var(--ink)]">Par niveau</h2>
        <ManualLevelGrid counts={stats.byLevel} />
      </section>

      <section className="space-y-4">
        <h2 className="font-reader text-lg font-semibold text-[var(--ink)]">Par thème</h2>
        <ManualCategoryGrid counts={stats.byCategory} />
      </section>
    </div>
  );
}
