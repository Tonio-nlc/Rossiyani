import { EditorialCard, GhostButton } from "@/components/design-system";
import type { HomeFeaturedLesson } from "@/features/home";

type HomeFeaturedLessonCardProps = {
  lesson: HomeFeaturedLesson;
};

export function HomeFeaturedLessonCard({ lesson }: HomeFeaturedLessonCardProps) {
  return (
    <EditorialCard
      href={lesson.href}
      eyebrow="Leçon du jour"
      title={lesson.title}
      subtitle={lesson.description}
      meta={`${lesson.levelLabel} · ${lesson.readingMinutes} min`}
      footer={<GhostButton href={lesson.href}>Lire la leçon →</GhostButton>}
    />
  );
}
