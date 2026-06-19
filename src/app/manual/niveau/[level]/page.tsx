import { notFound } from "next/navigation";

import { GhostButton, SectionHeader } from "@/components/design-system";
import { ManualLessonGrid } from "@/components/manual";
import { getLessonsByLevel, MANUAL_LEVEL_LABELS, MANUAL_LEVELS } from "@/features/manual";

type PageProps = {
  params: Promise<{ level: string }>;
};

export function generateStaticParams() {
  return MANUAL_LEVELS.map((level) => ({ level }));
}

export default async function ManualLevelPage({ params }: PageProps) {
  const { level } = await params;
  if (!MANUAL_LEVELS.includes(level as (typeof MANUAL_LEVELS)[number])) {
    notFound();
  }

  const typedLevel = level as (typeof MANUAL_LEVELS)[number];
  const lessons = getLessonsByLevel(typedLevel);

  return (
    <div className="pb-8">
      <header className="editorial-page-section pb-0">
        <GhostButton href="/manual">← Manuel</GhostButton>
        <div className="mt-4">
          <SectionHeader
            eyebrow="Niveau"
            title={MANUAL_LEVEL_LABELS[typedLevel]}
            description={`Table des matières — ${lessons.length} leçon${lessons.length > 1 ? "s" : ""} pour ce niveau.`}
          />
        </div>
      </header>

      <section className="editorial-page-section">
        <ManualLessonGrid
          lessons={lessons}
          emptyMessage="Les leçons de ce niveau arrivent bientôt."
        />
      </section>
    </div>
  );
}
