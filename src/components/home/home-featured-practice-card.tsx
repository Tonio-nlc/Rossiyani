import type { HomeFeaturedPractice } from "@/features/home";

import { HomeSessionCard } from "./home-session-card";

type HomeFeaturedPracticeCardProps = {
  practice: HomeFeaturedPractice;
  rationale: string;
};

export function HomeFeaturedPracticeCard({ practice, rationale }: HomeFeaturedPracticeCardProps) {
  return (
    <HomeSessionCard
      label="Pratique recommandée"
      rationale={rationale}
      href={practice.href}
      cta="Commencer la pratique →"
    >
      <h3 className="font-reader text-xl leading-snug text-[var(--ink)]">{practice.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
        {practice.description}
      </p>
      <p className="mt-2 text-metadata text-[var(--ink-muted)]">
        {practice.estimatedMinutes} min
      </p>
    </HomeSessionCard>
  );
}
