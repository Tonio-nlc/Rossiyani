import { ManualCategoryGrid, ManualLevelGrid } from "@/components/manual";
import { getManualStats } from "@/features/manual";

export default function ManualPage() {
  const stats = getManualStats();

  return (
    <div className="space-y-20 pb-20">
      <header className="space-y-4 pt-2">
        <h1 className="font-reader text-[clamp(2.25rem,5vw,3rem)] font-semibold tracking-tight text-[var(--ink)]">
          Manual
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-[var(--ink-secondary)]">
          Tout ce qu&apos;il faut pour maîtriser le russe.
        </p>
      </header>

      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-reader text-[clamp(1.5rem,3vw,1.875rem)] font-semibold text-[var(--ink)]">
            Par niveau
          </h2>
          <p className="text-sm text-[var(--ink-muted)]">A1 → C2 · progression CECR</p>
        </div>
        <ManualLevelGrid counts={stats.byLevel} />
      </section>

      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-reader text-[clamp(1.5rem,3vw,1.875rem)] font-semibold text-[var(--ink)]">
            Par thème
          </h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Grammaire, vocabulaire, expressions et usage natif.
          </p>
        </div>
        <ManualCategoryGrid counts={stats.byCategory} />
      </section>
    </div>
  );
}
