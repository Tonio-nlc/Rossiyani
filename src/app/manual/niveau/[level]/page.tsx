import { notFound } from "next/navigation";

import { ManualLessonGrid } from "@/components/manual";
import { getLessonsByLevel, MANUAL_LEVEL_LABELS, MANUAL_LEVELS } from "@/features/manual";

import { ManualBrowseHeader } from "@/components/manual/manual-browse-header";

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
    <div className="space-y-8">
      <ManualBrowseHeader
        title={MANUAL_LEVEL_LABELS[typedLevel]}
        description={`${lessons.length} leçon${lessons.length > 1 ? "s" : ""} pour ce niveau.`}
        backHref="/manual"
        backLabel="Manuel"
      />
      <ManualLessonGrid
        lessons={lessons}
        emptyMessage="Les leçons de ce niveau arrivent bientôt."
      />
    </div>
  );
}
