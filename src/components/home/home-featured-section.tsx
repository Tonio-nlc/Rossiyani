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

      <div
        className={
          lesson
            ? "mt-4 grid grid-cols-1 gap-[var(--layout-gap)] sm:grid-cols-2 sm:items-stretch [&>*]:h-full"
            : "mt-4"
        }
      >
        {lesson ? <HomeFeaturedLessonCard lesson={lesson} /> : null}
        <HomeContinueReadingCard texts={texts} />
      </div>
    </section>
  );
}
