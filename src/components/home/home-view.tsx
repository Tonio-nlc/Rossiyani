import type { HomeJournalData } from "@/features/home";
import type { TextListItem } from "@/features/texts";

import { HomeFeaturedSection } from "./home-featured-section";
import { HomePracticeSection } from "./home-practice-section";
import { HomeReviewSection } from "./home-review-section";
import { HomeTodaysDiscovery } from "./home-todays-discovery";

type HomeViewProps = {
  journal: HomeJournalData;
  texts: TextListItem[];
};

function HomeDivider() {
  return <hr className="my-[var(--layout-gap)] border-0 border-t border-[var(--hairline)]" />;
}

export function HomeView({ journal, texts }: HomeViewProps) {
  return (
    <div className="pb-[var(--space-2)]">
      <HomeTodaysDiscovery discovery={journal.todaysDiscovery} />

      <HomeDivider />

      <HomeReviewSection review={journal.review} reviewHref={journal.reviewHref} />

      <HomeDivider />

      <HomeFeaturedSection lesson={journal.featuredLesson} texts={texts} />

      <HomeDivider />

      <HomePracticeSection practice={journal.featuredPractice} />
    </div>
  );
}
