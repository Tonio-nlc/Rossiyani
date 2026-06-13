import type { HomeJournalData } from "@/features/home";
import type { TextListItem } from "@/features/texts";
import { isDisplayableLibraryText } from "@/lib/home/displayable-text";

import { HomeContinueReading } from "./home-continue-reading";
import { HomeFeaturedLesson } from "./home-featured-lesson";
import { HomeRecentDiscoveries } from "./home-recent-discoveries";
import { HomeReviewSection } from "./home-review-section";
import { HomeTodaysDiscovery } from "./home-todays-discovery";
import { HomeWelcome } from "./home-welcome";

type HomeViewProps = {
  journal: HomeJournalData;
  texts: TextListItem[];
};

export function HomeView({ journal, texts }: HomeViewProps) {
  const displayTexts = texts.filter(isDisplayableLibraryText);

  if (!journal.hasImportedTexts) {
    return (
      <div className="pb-[var(--layout-section-gap)]">
        <HomeWelcome />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--layout-section-gap)] pb-[var(--layout-section-gap)]">
      {journal.todaysDiscovery ? (
        <HomeTodaysDiscovery discovery={journal.todaysDiscovery} />
      ) : null}

      <HomeReviewSection review={journal.review} srsHref={journal.srsHref} />

      <HomeContinueReading texts={displayTexts} />

      {journal.featuredLesson ? <HomeFeaturedLesson lesson={journal.featuredLesson} /> : null}

      <HomeRecentDiscoveries />
    </div>
  );
}
