import {
  ManualCategoryGrid,
  ManualLessonGrid,
  ManualLevelGrid,
} from "@/components/manual";
import { ManualCurriculumGrid } from "@/components/manual/manual-curriculum-grid";
import {
  getManualCurriculum,
  getManualStats,
  listLessonSummaries,
  MANUAL_CURRICULUM_TOTAL,
} from "@/features/manual";

export default function ManualPage() {
  const stats = getManualStats();
  const curriculum = getManualCurriculum();
  const featured = listLessonSummaries().slice(0, 6);

  return (
    <div className="space-y-12">
      <header className="space-y-3 pb-2">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-violet-bright)]">
              Encyclopédie
            </p>
            <h1 className="mt-1 font-reader text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Manuel
            </h1>
          </div>
          <p className="text-sm text-[var(--muted)]">
            <strong className="font-semibold text-[var(--foreground)]">{stats.totalLessons}</strong>{" "}
            leçons · statique · versionné
          </p>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Un professeur particulier en Markdown — comprendre pourquoi les Russes parlent ainsi,
          sans jargon, sans IA, indépendant du Reader.
        </p>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="font-reader text-2xl font-semibold text-[var(--foreground)]">
            Feuille de route V1
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Objectif : {MANUAL_CURRICULUM_TOTAL} leçons fondamentales · {stats.totalLessons}{" "}
            publiées
          </p>
        </div>
        <ManualCurriculumGrid tracks={curriculum} totalPublished={stats.totalLessons} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-reader text-2xl font-semibold text-[var(--foreground)]">Par niveau</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">A1 → C2 · progression CECR</p>
        </div>
        <ManualLevelGrid counts={stats.byLevel} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-reader text-2xl font-semibold text-[var(--foreground)]">Par thème</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Grammaire, verbes, prononciation, culture…
          </p>
        </div>
        <ManualCategoryGrid counts={stats.byCategory} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-reader text-2xl font-semibold text-[var(--foreground)]">
              Leçons fondamentales
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Point de départ recommandé</p>
          </div>
        </div>
        <ManualLessonGrid lessons={featured} />
      </section>
    </div>
  );
}
