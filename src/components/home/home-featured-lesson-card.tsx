import Link from "next/link";

import type { HomeFeaturedLesson } from "@/features/home";

type HomeFeaturedLessonCardProps = {
  lesson: HomeFeaturedLesson;
};

export function HomeFeaturedLessonCard({ lesson }: HomeFeaturedLessonCardProps) {
  return (
    <Link
      href={lesson.href}
      className="focus-kb group block border border-[var(--hairline)] px-4 py-4 transition hover:border-[var(--hairline-strong)]"
    >
      <p className="home-section-label">Featured lesson</p>
      <h3 className="mt-2 font-reader text-lg leading-snug text-[var(--ink)] group-hover:text-[var(--color-link)]">
        {lesson.title}
      </h3>
      <p className="mt-1 line-clamp-1 text-sm text-[var(--ink-secondary)]">{lesson.description}</p>
      <p className="mt-2 text-metadata text-[var(--ink-muted)]">
        {lesson.levelLabel} · {lesson.readingMinutes} min
      </p>
      <p className="mt-2 text-sm text-[var(--ink-secondary)] group-hover:text-[var(--color-link)]">
        Open lesson →
      </p>
    </Link>
  );
}
