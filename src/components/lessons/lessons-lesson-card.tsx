import Link from "next/link";

import { MANUAL_CATEGORY_LABELS, MANUAL_LEVEL_LABELS } from "@/features/manual/constants";
import type { ManualLessonSummary } from "@/features/manual/types";
import { formatManualCardTitle } from "@/lib/manual/manual-card-layout";
import { lessonPath } from "@/lib/lessons/paths";

type LessonsLessonCardProps = {
  lesson: ManualLessonSummary;
};

export function LessonsLessonCard({ lesson }: LessonsLessonCardProps) {
  const { primary, secondary } = formatManualCardTitle(lesson.title);
  const href = lessonPath(lesson.slug);

  return (
    <Link href={href} className="lessons-lesson-card focus-kb">
      <h3 className="lessons-lesson-card__title">{primary}</h3>
      {secondary ? <p className="lessons-lesson-card__desc">{secondary}</p> : null}
      <div className="lessons-lesson-card__meta">
        <span className="lessons-tag">{MANUAL_LEVEL_LABELS[lesson.level]}</span>
        <span className="lessons-tag lessons-tag--accent">
          {MANUAL_CATEGORY_LABELS[lesson.category]}
        </span>
        <span className="lessons-tag">{lesson.estimatedReadingTime} min</span>
      </div>
      <span className="lessons-lesson-card__cta">Ouvrir la leçon →</span>
    </Link>
  );
}

type LessonsLessonGridProps = {
  lessons: ManualLessonSummary[];
  emptyTitle?: string;
  emptyDescription?: string;
};

export function LessonsLessonGrid({
  lessons,
  emptyTitle = "Aucune leçon",
  emptyDescription = "Les leçons de cette section arrivent bientôt.",
}: LessonsLessonGridProps) {
  if (lessons.length === 0) {
    return (
      <div className="lessons-empty">
        <p className="lessons-empty__title">{emptyTitle}</p>
        <p className="lessons-empty__desc">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="lessons-grid lessons-grid--lessons">
      {lessons.map((lesson) => (
        <LessonsLessonCard key={lesson.slug} lesson={lesson} />
      ))}
    </div>
  );
}
