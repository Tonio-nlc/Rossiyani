import Link from "next/link";

import {
  MANUAL_CATEGORY_LABELS,
  MANUAL_LEVEL_LABELS,
  type ManualCategory,
  type ManualLevel,
} from "@/features/manual";
import type { ManualLessonSummary } from "@/features/manual/types";
import {
  browseCardClass,
  formatManualCardTitle,
  manualCategoryLandingGridClass,
  manualLessonGridClass,
  manualLevelGridClass,
} from "@/lib/manual/manual-card-layout";

type ManualLessonCardProps = {
  lesson: ManualLessonSummary;
};

export function ManualLessonCard({ lesson }: ManualLessonCardProps) {
  const { primary, secondary } = formatManualCardTitle(lesson.title);

  return (
    <Link
      href={`/manual/lecons/${lesson.slug}`}
      prefetch
      className="focus-kb group flex min-h-[230px] flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-8 transition duration-200 hover:border-[var(--ink-muted)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-[var(--hairline)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
          {lesson.level.toUpperCase()}
        </span>
        <span className="text-xs text-[var(--ink-muted)]">{lesson.estimatedReadingTime} min</span>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-2">
        <h2 className="break-words font-reader text-xl leading-relaxed text-[var(--ink)]">
          {primary}
        </h2>
        {secondary ? (
          <p className="break-russian text-base leading-relaxed text-[var(--ink-secondary)]">
            {secondary}
          </p>
        ) : null}
        <p className="text-sm text-[var(--ink-muted)]">{MANUAL_CATEGORY_LABELS[lesson.category]}</p>

        {lesson.keywords.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {lesson.keywords.slice(0, 4).map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-[var(--hairline)] px-2.5 py-0.5 text-[10px] text-[var(--ink-muted)]"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <span className="mt-6 inline-flex w-fit text-sm text-[var(--ink-secondary)] transition group-hover:text-[var(--ink)] group-hover:underline group-hover:underline-offset-4">
        Lire la leçon →
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
      <p className="rounded-2xl border border-dashed border-[var(--hairline)] px-4 py-8 text-center text-sm text-[var(--ink-muted)]">
        {emptyMessage ?? "Aucune leçon disponible pour le moment."}
      </p>
    );
  }

  return (
    <div className={manualLessonGridClass}>
      {lessons.map((lesson) => (
        <ManualLessonCard key={lesson.slug} lesson={lesson} />
      ))}
    </div>
  );
}

type ManualLevelGridProps = {
  counts: Record<ManualLevel, number>;
};

export function ManualLevelGrid({ counts }: ManualLevelGridProps) {
  return (
    <div className={manualLevelGridClass}>
      {(Object.keys(MANUAL_LEVEL_LABELS) as ManualLevel[]).map((level) => (
        <Link key={level} href={`/manual/niveau/${level}`} prefetch className={browseCardClass}>
          <p className="font-reader text-lg text-[var(--ink)]">{level.toUpperCase()}</p>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
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
      <p className="text-sm text-[var(--ink-muted)]">Les premières leçons arrivent bientôt.</p>
    );
  }

  return (
    <div className={manualCategoryLandingGridClass}>
      {visible.map((category) => (
        <Link
          key={category}
          href={`/manual/theme/${category}`}
          prefetch
          className={browseCardClass}
        >
          <p className="font-reader text-base leading-snug text-[var(--ink)]">
            {MANUAL_CATEGORY_LABELS[category]}
          </p>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            {counts[category]} leçon{counts[category] > 1 ? "s" : ""}
          </p>
        </Link>
      ))}
    </div>
  );
}
