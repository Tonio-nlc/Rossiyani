import type { HomeFeaturedLesson } from "@/features/home";
import type { TextListItem } from "@/features/texts";

import { HomeContinueReadingCard } from "./home-continue-reading-card";
import { HomeFeaturedLessonCard } from "./home-featured-lesson-card";
import { HomeFeaturedLessonSync } from "./home-featured-lesson-sync";

type HomeFeaturedSectionProps = {
  lesson: HomeFeaturedLesson;
  texts: TextListItem[];
};

export function HomeFeaturedSection({ lesson, texts }: HomeFeaturedSectionProps) {
  return (
    <section>
      <p className="home-section-label">Featured</p>

      <HomeFeaturedLessonSync slug={lesson.slug} dateKey={lesson.dateKey} />

      <div className="mt-4 grid grid-cols-1 gap-[var(--layout-gap)] sm:grid-cols-2 sm:items-stretch [&>*]:h-full">
        <HomeContinueReadingCard texts={texts} />
        <HomeFeaturedLessonCard lesson={lesson} />
      </div>
    </section>
  );
}
