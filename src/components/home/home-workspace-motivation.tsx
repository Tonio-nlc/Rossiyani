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
    <section className="home-ws-section home-ws-section--quiet" aria-labelledby="home-ws-motivation-heading">
      <article className="home-ws-motivation">
        <div className="home-ws-motivation__copy">
          <h2 id="home-ws-motivation-heading" className="home-ws-motivation__title">
            {streak.currentStreak} day{streak.currentStreak === 1 ? "" : "s"} and counting
          </h2>
          <p className="home-ws-motivation__lead">
            A few minutes of reading keeps your rhythm strong.
          </p>
        </div>
        <Link href={ctaHref} className="home-ws-motivation__cta focus-kb">
          Continue Reading →
        </Link>
      </article>
    </section>
  );
}
