import type { HomeJournalData } from "@/features/home";
import type { TextListItem } from "@/features/texts";

import { HomeFeaturedSection } from "./home-featured-section";
import { HomePracticeSection } from "./home-practice-section";
import { HomePrimaryActions } from "./home-primary-actions";
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

      <div className="mt-6">
        <HomePrimaryActions srsHref={journal.srsHref} readHref={journal.readHref} />
      </div>

      <HomeDivider />

      <HomeReviewSection review={journal.review} />

      <HomeDivider />

      <HomeFeaturedSection lesson={journal.featuredLesson} texts={texts} />

      <HomeDivider />

      <HomePracticeSection />
    </div>
  );
}
