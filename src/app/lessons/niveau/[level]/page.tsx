import { notFound } from "next/navigation";

import { LessonsBrowseSection, LessonsCollectionHeader } from "@/components/lessons";
import { getLessonsByLevel, MANUAL_LEVEL_LABELS, MANUAL_LEVELS } from "@/features/manual";
import { LESSONS_HOME } from "@/lib/lessons/paths";

type PageProps = {
  params: Promise<{ level: string }>;
};

export function generateStaticParams() {
  return MANUAL_LEVELS.map((level) => ({ level }));
}

export default async function LessonsLevelPage({ params }: PageProps) {
  const { level } = await params;
  if (!MANUAL_LEVELS.includes(level as (typeof MANUAL_LEVELS)[number])) {
    notFound();
  }

  const typedLevel = level as (typeof MANUAL_LEVELS)[number];
  const lessons = getLessonsByLevel(typedLevel);

  return (
    <>
      <LessonsCollectionHeader
        title={MANUAL_LEVEL_LABELS[typedLevel]}
        meta={`${lessons.length} leçon${lessons.length > 1 ? "s" : ""}`}
        backHref={LESSONS_HOME}
        backLabel="← Leçons"
      />
      <LessonsBrowseSection
        title={MANUAL_LEVEL_LABELS[typedLevel]}
        lessons={lessons}
        emptyMessage="Les leçons de ce niveau arrivent bientôt."
      />
    </>
  );
}
