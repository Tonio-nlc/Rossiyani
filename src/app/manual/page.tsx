import { ManualCategoryGrid, ManualLevelGrid } from "@/components/manual";
import { SectionHeader } from "@/components/design-system";
import { getManualStats } from "@/features/manual";

export const metadata = {
  title: "Manuel · Rossiyani",
  description:
    "Grammaire, vocabulaire, prononciation et usage natif — un manuel académique pour apprendre le russe.",
};

export default function ManualPage() {
  const stats = getManualStats();

  return (
    <div className="pb-8">
      <header className="editorial-page-section pb-0">
        <SectionHeader
          eyebrow="Manuel"
          title="Grammaire et usage"
          description="Un manuel académique — grammaire, vocabulaire, prononciation et usage natif, structuré comme un cours universitaire."
          meta={`${stats.totalLessons} leçons`}
        />
      </header>

      <section className="editorial-page-section pb-0">
        <p className="text-eyebrow mb-4">Par niveau</p>
        <ManualLevelGrid counts={stats.byLevel} />
      </section>

      <section className="editorial-page-section">
        <p className="text-eyebrow mb-4">Par thème</p>
        <ManualCategoryGrid counts={stats.byCategory} />
      </section>
    </div>
  );
}
