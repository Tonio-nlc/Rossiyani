import Link from "next/link";

import {
  MANUAL_CATEGORY_LABELS,
  MANUAL_CURRICULUM_TOTAL,
  type ManualCategory,
} from "@/features/manual";

type ManualCurriculumGridProps = {
  tracks: Array<{
    category: ManualCategory;
    published: number;
    target: number;
    percent: number;
  }>;
  totalPublished: number;
};

export function ManualCurriculumGrid({ tracks, totalPublished }: ManualCurriculumGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          Progression éditoriale :{" "}
          <strong className="text-[var(--foreground)]">{totalPublished}</strong> /{" "}
          {MANUAL_CURRICULUM_TOTAL} leçons cibles
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map(({ category, published, target, percent }) => (
          <Link
            key={category}
            href={`/manual/theme/${category}`}
            prefetch
            className="focus-kb btn-interactive rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-reader text-base font-semibold text-[var(--foreground)]">
                {MANUAL_CATEGORY_LABELS[category]}
              </p>
              <span className="text-[10px] tabular-nums text-[var(--muted)]">{percent} %</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--background)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)]"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {published} / {target} leçon{target > 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
