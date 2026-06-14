import Link from "next/link";

import {
  MANUAL_CATEGORY_LABELS,
  MANUAL_LEVEL_LABELS,
  type ManualLesson,
} from "@/features/manual";
import { getLessonBySlug } from "@/features/manual";

import { ManualMarkdown } from "./manual-markdown";
import { ManualLessonVisitTracker } from "./manual-lesson-visit-tracker";

type ManualLessonViewProps = {
  lesson: ManualLesson;
};

export function ManualLessonView({ lesson }: ManualLessonViewProps) {
  const related = lesson.relatedLessons
    .map((slug) => getLessonBySlug(slug))
    .filter((item): item is ManualLesson => item !== null);

  return (
    <article className="mx-auto max-w-3xl">
      <ManualLessonVisitTracker slug={lesson.slug} />
      <header className="space-y-4 border-b border-[var(--border)] pb-8">
        <Link
          href="/manual"
          className="focus-kb text-xs text-[var(--muted)] transition hover:text-[var(--accent-violet-bright)]"
        >
          ← Manuel
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--accent-violet-bright)]">
            {lesson.level.toUpperCase()}
          </span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] font-medium text-[var(--muted)]">
            {MANUAL_CATEGORY_LABELS[lesson.category]}
          </span>
          <span className="text-xs text-[var(--muted)]">
            {lesson.estimatedReadingTime} min · difficulté {lesson.difficulty}/5
          </span>
        </div>

        <h1 className="font-reader text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
          {lesson.title}
        </h1>

        {lesson.keywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {lesson.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--muted)]"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : null}

        {lesson.prerequisites.length > 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Prérequis :{" "}
            {lesson.prerequisites.map((slug, index) => {
              const prereq = getLessonBySlug(slug);
              if (!prereq) {
                return (
                  <span key={slug}>
                    {index > 0 ? ", " : ""}
                    {slug}
                  </span>
                );
              }
              return (
                <span key={slug}>
                  {index > 0 ? ", " : ""}
                  <Link
                    href={`/manual/lecons/${slug}`}
                    className="text-[var(--accent-violet-bright)] hover:underline"
                  >
                    {prereq.title}
                  </Link>
                </span>
              );
            })}
          </p>
        ) : null}
      </header>

      <div className="mt-10">
        <ManualMarkdown content={lesson.content} />
      </div>

      {related.length > 0 ? (
        <footer className="mt-12 border-t border-[var(--border)] pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Leçons liées
          </p>
          <ul className="mt-4 space-y-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/manual/lecons/${item.slug}`}
                  className="focus-kb font-reader text-[var(--accent-violet-bright)] hover:underline"
                >
                  {item.title}
                </Link>
                <span className="ml-2 text-xs text-[var(--muted)]">
                  {MANUAL_LEVEL_LABELS[item.level]}
                </span>
              </li>
            ))}
          </ul>
        </footer>
      ) : null}
    </article>
  );
}
