import Link from "next/link";

import type { HomeDashboardMetrics } from "@/lib/home/build-home-dashboard-metrics";
import type { LearningStreakSnapshot } from "@/lib/home/learning-streak";

type HomeWorkspaceMotivationProps = {
  metrics: HomeDashboardMetrics;
  streak: LearningStreakSnapshot;
  continueHref: string | null;
};

export function HomeWorkspaceMotivation({
  metrics,
  streak,
  continueHref,
}: HomeWorkspaceMotivationProps) {
  const showStreak = streak.currentStreak > 0;
  const eyebrow = showStreak ? "Keep Your Streak Alive" : "Recent Achievements";
  const title = showStreak
    ? `${streak.currentStreak} day${streak.currentStreak === 1 ? "" : "s"} and counting`
    : metrics.isReturning
      ? "You are building momentum"
      : "Start your first session today";
  const lead = showStreak
    ? "A few minutes of reading keeps your rhythm strong. Pick up where you left off."
    : metrics.isReturning
      ? "Every word explored and text finished moves you closer to fluency."
      : "Open a text, follow the words, and your progress will appear here.";

  const ctaHref = continueHref ?? "/library";
  const ctaLabel = showStreak ? "Continue reading →" : metrics.isReturning ? "Keep learning →" : "Browse library →";

  return (
    <section className="home-ws-section" aria-labelledby="home-ws-motivation-heading">
      <article className="home-ws-motivation">
        <div>
          <p className="home-ws-motivation__eyebrow">{eyebrow}</p>
          <h2 id="home-ws-motivation-heading" className="home-ws-motivation__title">
            {title}
          </h2>
          <p className="home-ws-motivation__lead">{lead}</p>
          {!showStreak && metrics.isReturning ? (
            <ul className="home-ws-motivation__stats">
              <li className="home-ws-motivation__stat">
                <span className="home-ws-motivation__stat-value">{metrics.wordsExplored}</span>
                <span className="home-ws-motivation__stat-label">Words explored</span>
              </li>
              <li className="home-ws-motivation__stat">
                <span className="home-ws-motivation__stat-value">{metrics.textsCompleted}</span>
                <span className="home-ws-motivation__stat-label">Texts completed</span>
              </li>
              <li className="home-ws-motivation__stat">
                <span className="home-ws-motivation__stat-value">{metrics.conceptsExplored}</span>
                <span className="home-ws-motivation__stat-label">Concepts explored</span>
              </li>
            </ul>
          ) : null}
        </div>
        <Link href={ctaHref} className="home-ws-motivation__cta focus-kb">
          {ctaLabel}
        </Link>
      </article>
    </section>
  );
}
