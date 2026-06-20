import {
  EditorialCard,
  GhostButton,
  PrimaryButton,
  SectionHeader,
} from "@/components/design-system";
import { Reference } from "@/components/editorial";
import {
  MANUAL_LEVEL_LABELS,
  getLessonBySlug,
  type ManualLesson,
} from "@/features/manual";

import { ManualMarkdown } from "./manual-markdown";
import { ManualLessonVisitTracker } from "./manual-lesson-visit-tracker";

type ManualLessonViewProps = {
  lesson: ManualLesson;
};

export function ManualLessonView({ lesson }: ManualLessonViewProps) {
  const related = lesson.relatedLessons
    .map((slug) => getLessonBySlug(slug))
    .filter((item): item is ManualLesson => item !== null);

  const practiceHref = `/practice?context=${encodeURIComponent(lesson.title)}`;

  return (
    <article className="pb-8">
      <ManualLessonVisitTracker slug={lesson.slug} />

      <header className="editorial-page-section pb-0">
        <GhostButton href="/manual">← Manuel</GhostButton>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            title={lesson.title}
            meta={`${MANUAL_LEVEL_LABELS[lesson.level]} · ${lesson.estimatedReadingTime} min`}
          />
          <PrimaryButton href={practiceHref}>Pratiquer →</PrimaryButton>
        </div>

        {lesson.prerequisites.length > 0 ? (
          <PracticeMarginPrerequisites lesson={lesson} />
        ) : null}
      </header>

      <section className="editorial-page-section pb-0">
        <ManualMarkdown content={lesson.content} />
      </section>

      {related.length > 0 ? (
        <section className="editorial-page-section pb-0">
          <p className="text-eyebrow mb-3">Liées</p>
          <div className="library-editorial-grid">
            {related.map((item) => (
              <EditorialCard
                key={item.slug}
                href={`/manual/lecons/${item.slug}`}
                title={item.title}
                footer={<GhostButton href={`/manual/lecons/${item.slug}`}>Lire →</GhostButton>}
              />
            ))}
          </div>
        </section>
      ) : null}

      <footer className="editorial-page-section border-t border-[var(--hairline)] pt-6">
        <GhostButton href="/manual">← Manuel</GhostButton>
      </footer>
    </article>
  );
}

function PracticeMarginPrerequisites({ lesson }: { lesson: ManualLesson }) {
  return (
    <aside className="mt-4 border-l-2 border-[var(--hairline)] pl-4 text-sm text-[var(--ink-muted)]">
      <p className="text-metadata mb-2">Prérequis</p>
      <ul className="space-y-1">
        {lesson.prerequisites.map((slug) => {
          const prereq = getLessonBySlug(slug);
          return (
            <li key={slug}>
              {prereq ? (
                <Reference href={`/manual/lecons/${slug}`}>{prereq.title}</Reference>
              ) : (
                slug
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
