import type { HomeFeaturedLesson } from "@/features/home";
import type { TextListItem } from "@/features/texts";

import { HomeContinueReadingCard } from "./home-continue-reading-card";
import { HomeFeaturedLessonCard } from "./home-featured-lesson-card";

type HomeFeaturedSectionProps = {
  lesson: HomeFeaturedLesson | null;
  texts: TextListItem[];
};

export function HomeFeaturedSection({ lesson, texts }: HomeFeaturedSectionProps) {
  return (
    <section>
      <p className="home-section-label">Featured</p>

      <div className="mt-4 grid grid-cols-1 gap-[var(--layout-gap)] sm:grid-cols-2">
        {lesson ? (
          <HomeFeaturedLessonCard lesson={lesson} />
        ) : (
          <div className="border border-[var(--hairline)] px-4 py-4">
            <p className="home-section-label">Featured lesson</p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">Lessons coming soon.</p>
          </div>
        )}

        <HomeContinueReadingCard texts={texts} />
      </div>
    </section>
  );
}
