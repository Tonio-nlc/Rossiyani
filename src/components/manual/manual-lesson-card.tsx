import {
  EditorialCard,
  EmptyState,
  GhostButton,
  Tag,
} from "@/components/design-system";
import {
  MANUAL_CATEGORY_LABELS,
  MANUAL_LEVEL_LABELS,
  type ManualCategory,
  type ManualLevel,
} from "@/features/manual";
import type { ManualLessonSummary } from "@/features/manual/types";
import { formatManualCardTitle } from "@/lib/manual/manual-card-layout";

type ManualLessonCardProps = {
  lesson: ManualLessonSummary;
};

export function ManualLessonCard({ lesson }: ManualLessonCardProps) {
  const { primary, secondary } = formatManualCardTitle(lesson.title);
  const href = `/manual/lecons/${lesson.slug}`;

  return (
    <EditorialCard
      href={href}
      eyebrow={lesson.level.toUpperCase()}
      title={primary}
      subtitle={secondary ?? undefined}
      meta={`${MANUAL_CATEGORY_LABELS[lesson.category]} · ${lesson.estimatedReadingTime} min · difficulté ${lesson.difficulty}/5`}
      footer={
        <>
          {lesson.keywords.length > 0 ? (
            <ul className="mb-4 flex flex-wrap gap-2">
              {lesson.keywords.slice(0, 4).map((keyword) => (
                <li key={keyword}>
                  <Tag>{keyword}</Tag>
                </li>
              ))}
            </ul>
          ) : null}
          <GhostButton href={href}>Lire la leçon →</GhostButton>
        </>
      }
    />
  );
}

type ManualLessonGridProps = {
  lessons: ManualLessonSummary[];
  emptyMessage?: string;
};

export function ManualLessonGrid({ lessons, emptyMessage }: ManualLessonGridProps) {
  if (lessons.length === 0) {
    return (
      <EmptyState
        title="Aucune leçon"
        description={emptyMessage ?? "Aucune leçon disponible pour le moment."}
        action={{ label: "Retour au manuel", href: "/manual" }}
      />
    );
  }

  return (
    <div className="library-editorial-grid">
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
    <div className="library-editorial-grid">
      {(Object.keys(MANUAL_LEVEL_LABELS) as ManualLevel[]).map((level) => {
        const href = `/manual/niveau/${level}`;
        const count = counts[level];
        return (
          <EditorialCard
            key={level}
            href={href}
            eyebrow="Niveau"
            title={MANUAL_LEVEL_LABELS[level]}
            meta={`${count} leçon${count > 1 ? "s" : ""}`}
            footer={<GhostButton href={href}>Parcourir →</GhostButton>}
          />
        );
      })}
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
      <EmptyState
        title="Bientôt disponible"
        description="Les premières leçons arrivent bientôt."
      />
    );
  }

  return (
    <div className="library-editorial-grid">
      {visible.map((category) => {
        const href = `/manual/theme/${category}`;
        const count = counts[category];
        return (
          <EditorialCard
            key={category}
            href={href}
            eyebrow="Thème"
            title={MANUAL_CATEGORY_LABELS[category]}
            meta={`${count} leçon${count > 1 ? "s" : ""}`}
            footer={<GhostButton href={href}>Parcourir →</GhostButton>}
          />
        );
      })}
    </div>
  );
}
