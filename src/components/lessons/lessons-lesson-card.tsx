import { Badge, Card, EmptyState } from "@/components/design-system";
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
    <Card href={href} className="lessons-lesson-card ws-card">
      <div className="ws-card__body">
        <h3 className="r3-title ws-card__title lessons-lesson-card__title">{primary}</h3>
        {secondary ? (
          <p className="r3-lead ws-card__desc lessons-lesson-card__desc">{secondary}</p>
        ) : null}
      </div>
      <div className="ws-card__meta lessons-lesson-card__meta">
        <Badge tone="blue">{MANUAL_LEVEL_LABELS[lesson.level]}</Badge>
        <Badge tone="violet">{MANUAL_CATEGORY_LABELS[lesson.category]}</Badge>
        <Badge tone="neutral">{lesson.estimatedReadingTime} min</Badge>
      </div>
      <footer className="ws-card__footer">
        <span className="lessons-lesson-card__cta">Ouvrir la leçon →</span>
      </footer>
    </Card>
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
      <EmptyState
        className="lessons-empty"
        eyebrow="Leçons"
        title={emptyTitle}
        description={emptyDescription}
        action={{ label: "Voir toutes les leçons", href: "/lessons" }}
      />
    );
  }

  return (
    <div className="lessons-grid lessons-grid--lessons ws-card-grid ws-card-grid--items">
      {lessons.map((lesson) => (
        <div key={lesson.slug} className="ws-card-grid__cell">
          <LessonsLessonCard lesson={lesson} />
        </div>
      ))}
    </div>
  );
}
