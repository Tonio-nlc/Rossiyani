import type { TodaysDiscovery } from "@/features/discovery";
import type { HomeFeaturedPractice } from "@/features/home";
import { recommendedPracticeRationale } from "@/lib/home/session-rationale";

import { HomeFeaturedPracticeCard } from "./home-featured-practice-card";

type HomePracticeSectionProps = {
  practice: HomeFeaturedPractice;
  discovery: TodaysDiscovery | null;
};

export function HomePracticeSection({ practice, discovery }: HomePracticeSectionProps) {
  const rationale = recommendedPracticeRationale(practice, discovery);

  return (
    <HomeFeaturedPracticeCard practice={practice} rationale={rationale} />
  );
}
