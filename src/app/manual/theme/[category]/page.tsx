import { notFound } from "next/navigation";

import { GhostButton, SectionHeader } from "@/components/design-system";
import { ManualLessonGrid } from "@/components/manual";
import {
  getLessonsByCategory,
  MANUAL_CATEGORIES,
  MANUAL_CATEGORY_LABELS,
} from "@/features/manual";

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
    <div className="pb-8">
      <header className="editorial-page-section pb-0">
        <GhostButton href="/manual">← Manuel</GhostButton>
        <div className="mt-4">
          <SectionHeader
            eyebrow="Thème"
            title={MANUAL_CATEGORY_LABELS[typedCategory]}
            description={`Table des matières — ${lessons.length} leçon${lessons.length > 1 ? "s" : ""} sur ce thème.`}
          />
        </div>
      </header>

      <section className="editorial-page-section">
        <ManualLessonGrid
          lessons={lessons}
          emptyMessage="Les leçons de ce thème arrivent bientôt."
        />
      </section>
    </div>
  );
}
