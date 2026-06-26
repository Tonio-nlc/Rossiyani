import { notFound } from "next/navigation";

import { LessonsBrowseSection, LessonsCollectionHeader } from "@/components/lessons";
import {
  getLessonsByCategory,
  MANUAL_CATEGORIES,
  MANUAL_CATEGORY_LABELS,
  type ManualCategory,
} from "@/features/manual";
import { LESSONS_HOME } from "@/lib/lessons/paths";

type PageProps = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return MANUAL_CATEGORIES.map((category) => ({ category }));
}

export default async function LessonsThemePage({ params }: PageProps) {
  const { category } = await params;
  if (!MANUAL_CATEGORIES.includes(category as ManualCategory)) {
    notFound();
  }

  const typedCategory = category as ManualCategory;
  const lessons = getLessonsByCategory(typedCategory);

  return (
    <>
      <LessonsCollectionHeader
        title={MANUAL_CATEGORY_LABELS[typedCategory]}
        description={`Parcours ${MANUAL_CATEGORY_LABELS[typedCategory].toLowerCase()} — leçons thématiques.`}
        meta={`${lessons.length} leçon${lessons.length > 1 ? "s" : ""}`}
        backHref={LESSONS_HOME}
        backLabel="← Leçons"
      />
      <LessonsBrowseSection
        title={MANUAL_CATEGORY_LABELS[typedCategory]}
        lessons={lessons}
        emptyMessage="Les leçons de cette collection arrivent bientôt."
      />
    </>
  );
}
