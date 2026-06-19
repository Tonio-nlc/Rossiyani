import {
  Divider,
  EditorialCard,
  GhostButton,
  PrimaryButton,
  SectionHeader,
  Tag,
} from "@/components/design-system";
import { Reference } from "@/components/editorial";
import {
  MANUAL_CATEGORY_LABELS,
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
        <div className="mt-4">
          <SectionHeader
            eyebrow="Manuel"
            title={lesson.title}
            meta={`${MANUAL_LEVEL_LABELS[lesson.level]} · ${MANUAL_CATEGORY_LABELS[lesson.category]} · ${lesson.estimatedReadingTime} min · difficulté ${lesson.difficulty}/5`}
          />
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          <li>
            <Tag>{lesson.level.toUpperCase()}</Tag>
          </li>
          <li>
            <Tag>{MANUAL_CATEGORY_LABELS[lesson.category]}</Tag>
          </li>
          <li>
            <Tag>Difficulté {lesson.difficulty}/5</Tag>
          </li>
          {lesson.keywords.map((keyword) => (
            <li key={keyword}>
              <Tag>{keyword}</Tag>
            </li>
          ))}
        </ul>

        {lesson.prerequisites.length > 0 ? (
          <PracticeMarginPrerequisites lesson={lesson} />
        ) : null}
      </header>

      <section className="editorial-page-section pb-0">
        <ManualMarkdown content={lesson.content} />
      </section>

      {related.length > 0 ? (
        <section className="editorial-page-section pb-0">
          <p className="text-eyebrow mb-4">Concepts liés</p>
          <div className="library-editorial-grid">
            {related.map((item) => (
              <EditorialCard
                key={item.slug}
                href={`/manual/lecons/${item.slug}`}
                eyebrow={MANUAL_LEVEL_LABELS[item.level]}
                title={item.title}
                meta={`${item.estimatedReadingTime} min`}
                footer={
                  <GhostButton href={`/manual/lecons/${item.slug}`}>Lire →</GhostButton>
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="editorial-page-section pb-0">
        <Divider />
        <div className="mt-6 space-y-4">
          <p className="text-eyebrow">Pratique</p>
          <p className="editorial-intro max-w-2xl">
            Appliquez cette leçon en formulant vos propres phrases en russe.
          </p>
          <PrimaryButton href={practiceHref}>Mettre en pratique →</PrimaryButton>
        </div>
      </section>

      <footer className="editorial-page-section flex flex-wrap gap-4 border-t border-[var(--hairline)] pt-6">
        <GhostButton href="/manual">Retour au manuel →</GhostButton>
        <Reference href={practiceHref}>Ouvrir dans la pratique →</Reference>
      </footer>
    </article>
  );
}

function PracticeMarginPrerequisites({ lesson }: { lesson: ManualLesson }) {
  return (
    <aside className="mt-6 border-l-2 border-[var(--hairline)] pl-4 text-sm leading-relaxed text-[var(--ink-muted)]">
      <p className="text-eyebrow mb-2">Prérequis</p>
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
