import Link from "next/link";

import {
  MANUAL_CATEGORY_LABELS,
  MANUAL_LEVEL_LABELS,
  type ManualCategory,
  type ManualLevel,
} from "@/features/manual";
import type { ManualLessonSummary } from "@/features/manual/types";

type ManualLessonCardProps = {
  lesson: ManualLessonSummary;
};

export function ManualLessonCard({ lesson }: ManualLessonCardProps) {
  return (
    <Link
      href={`/manual/lecons/${lesson.slug}`}
      prefetch
      className="focus-kb card-hover surface-elevated flex h-full flex-col rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--accent-violet-bright)]">
          {lesson.level.toUpperCase()}
        </span>
        <span className="text-xs text-[var(--muted)]">{lesson.estimatedReadingTime} min</span>
      </div>

      <h2 className="mt-4 font-reader text-xl font-semibold leading-snug text-[var(--foreground)] transition group-hover:text-[var(--accent-violet-bright)]">
        {lesson.title}
      </h2>

      <p className="mt-2 text-sm text-[var(--muted)]">
        {MANUAL_CATEGORY_LABELS[lesson.category]}
      </p>

      {lesson.keywords.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {lesson.keywords.slice(0, 4).map((keyword) => (
            <span
              key={keyword}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--muted)]"
            >
              {keyword}
            </span>
          ))}
        </div>
      ) : null}

      <span className="btn-primary btn-interactive mt-auto inline-flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-semibold">
        Lire la leçon
      </span>
    </Link>
  );
}

type ManualLessonGridProps = {
  lessons: ManualLessonSummary[];
  emptyMessage?: string;
};

export function ManualLessonGrid({ lessons, emptyMessage }: ManualLessonGridProps) {
  if (lessons.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
        {emptyMessage ?? "Aucune leçon disponible pour le moment."}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lessons.map((lesson) => (
        <ManualLessonCard key={lesson.slug} lesson={lesson} />
      ))}
    </div>
  );
}

type ManualLevelGridProps = {
  counts: Record<ManualLevel, number>;
};

const browseCardClass =
  "focus-kb group block rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] px-5 py-4 transition duration-200 hover:border-[var(--ink-muted)] hover:shadow-[0_2px_14px_rgba(0,0,0,0.05)]";

export function ManualLevelGrid({ counts }: ManualLevelGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(MANUAL_LEVEL_LABELS) as ManualLevel[]).map((level) => (
        <Link key={level} href={`/manual/niveau/${level}`} prefetch className={browseCardClass}>
          <p className="font-reader text-lg text-[var(--ink)]">{MANUAL_LEVEL_LABELS[level]}</p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {counts[level]} leçon{counts[level] > 1 ? "s" : ""}
          </p>
        </Link>
      ))}
    </div>
  );
}

type ManualCategoryGridProps = {
  counts: Record<ManualCategory, number>;
};

export function ManualCategoryGrid({ counts }: ManualCategoryGridProps) {
  const visible = (Object.keys(MANUAL_CATEGORY_LABELS) as ManualCategory[]).filter(
    (category) => counts[category] > 0,
  );

  if (visible.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        Les premières leçons arrivent bientôt.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((category) => (
        <Link
          key={category}
          href={`/manual/theme/${category}`}
          prefetch
          className={browseCardClass}
        >
          <p className="font-reader text-lg text-[var(--ink)]">
            {MANUAL_CATEGORY_LABELS[category]}
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {counts[category]} leçon{counts[category] > 1 ? "s" : ""}
          </p>
        </Link>
      ))}
    </div>
  );
}
