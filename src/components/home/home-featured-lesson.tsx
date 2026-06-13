import Link from "next/link";

import type { HomeFeaturedLesson } from "@/features/home";

type HomeFeaturedLessonProps = {
  lesson: HomeFeaturedLesson;
};

export function HomeFeaturedLesson({ lesson }: HomeFeaturedLessonProps) {
  return (
    <section>
      <p className="home-section-label">Featured lesson</p>

      <Link href={lesson.href} className="focus-kb group mt-6 block max-w-2xl">
        <h2 className="font-reader text-[clamp(1.5rem,3vw,2rem)] leading-tight tracking-tight text-[var(--ink)] transition group-hover:text-[var(--color-link)]">
          {lesson.title}
        </h2>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--ink-secondary)]">
          {lesson.description}
        </p>

        <p className="mt-4 text-sm text-[var(--ink-muted)]">
          {lesson.levelLabel} · {lesson.readingMinutes} min
        </p>

        <p className="mt-6 text-sm font-medium text-[var(--ink)] transition group-hover:text-[var(--color-link)]">
          Open lesson →
        </p>
      </Link>
    </section>
  );
}
