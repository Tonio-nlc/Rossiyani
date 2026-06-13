import { notFound } from "next/navigation";

import { ManualLessonGrid } from "@/components/manual";
import {
  getLessonsByCategory,
  MANUAL_CATEGORIES,
  MANUAL_CATEGORY_LABELS,
} from "@/features/manual";

import { ManualBrowseHeader } from "@/components/manual/manual-browse-header";

type PageProps = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return MANUAL_CATEGORIES.map((category) => ({ category }));
}

export default async function ManualCategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!MANUAL_CATEGORIES.includes(category as (typeof MANUAL_CATEGORIES)[number])) {
    notFound();
  }

  const typedCategory = category as (typeof MANUAL_CATEGORIES)[number];
  const lessons = getLessonsByCategory(typedCategory);

  return (
    <div className="space-y-8">
      <ManualBrowseHeader
        title={MANUAL_CATEGORY_LABELS[typedCategory]}
        description={`${lessons.length} leçon${lessons.length > 1 ? "s" : ""} sur ce thème.`}
        backHref="/manual"
        backLabel="Manuel"
      />
      <ManualLessonGrid
        lessons={lessons}
        emptyMessage="Les leçons de ce thème arrivent bientôt."
      />
    </div>
  );
}
