import type { HomeJournalData } from "@/features/home";
import type { TextListItem } from "@/features/texts";

import { HomeContinueExploringSection } from "./home-continue-exploring-section";
import { HomeContinueReadingCard } from "./home-continue-reading-card";
import { HomePracticeSection } from "./home-practice-section";
import { HomeReviewSection } from "./home-review-section";
import { HomeTodaysDiscovery } from "./home-todays-discovery";

type HomeViewProps = {
  journal: HomeJournalData;
  texts: TextListItem[];
};

function SessionDivider() {
  return <hr className="my-10 border-0 border-t border-[var(--hairline)]" aria-hidden />;
}

export function HomeView({ journal, texts }: HomeViewProps) {
  return (
    <div className="pb-[var(--space-2)]">
      <header className="pb-8 pt-[var(--space-3)]">
        <p className="home-section-label">Dashboard</p>
        <h1 className="mt-2 font-reader text-[clamp(1.5rem,3vw,1.875rem)] leading-tight tracking-tight text-[var(--ink)]">
          Votre session
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
          Lecture → exploration → pratique. Chaque suggestion prolonge le fil de votre
          apprentissage.
        </p>
      </header>

      <HomeContinueReadingCard texts={texts} />

      <SessionDivider />

      <HomeTodaysDiscovery discovery={journal.todaysDiscovery} />

      <SessionDivider />

      <HomeReviewSection review={journal.review} reviewHref={journal.reviewHref} />

      <SessionDivider />

      <HomePracticeSection
        practice={journal.featuredPractice}
        discovery={journal.todaysDiscovery}
      />

      <SessionDivider />

      <HomeContinueExploringSection
        lesson={journal.featuredLesson}
        discovery={journal.todaysDiscovery}
      />
    </div>
  );
}
