import Link from "next/link";

import type { LearningStreakSnapshot } from "@/lib/home/learning-streak";

type HomeWorkspaceMotivationProps = {
  streak: LearningStreakSnapshot;
  continueHref: string | null;
};

export function HomeWorkspaceMotivation({ streak, continueHref }: HomeWorkspaceMotivationProps) {
  if (streak.currentStreak <= 0) {
    return null;
  }

  const ctaHref = continueHref ?? "/library";

  return (
    <section className="home-ws-section" aria-labelledby="home-ws-motivation-heading">
      <article className="home-ws-motivation">
        <div className="home-ws-motivation__copy">
          <h2 id="home-ws-motivation-heading" className="home-ws-motivation__title">
            {streak.currentStreak}-day streak — keep it going
          </h2>
          <p className="home-ws-motivation__lead">
            A few minutes today keeps your learning momentum strong.
          </p>
        </div>
        <Link href={ctaHref} className="home-ws-motivation__cta focus-kb">
          Continue lesson →
        </Link>
      </article>
    </section>
  );
}
