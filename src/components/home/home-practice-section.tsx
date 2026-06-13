import type { HomeFeaturedPractice } from "@/features/home";

import { HomeFeaturedPracticeCard } from "./home-featured-practice-card";

type HomePracticeSectionProps = {
  practice: HomeFeaturedPractice;
};

export function HomePracticeSection({ practice }: HomePracticeSectionProps) {
  return (
    <section>
      <p className="home-section-label">Practice</p>

      <div className="mt-4">
        <HomeFeaturedPracticeCard practice={practice} />
      </div>
    </section>
  );
}
