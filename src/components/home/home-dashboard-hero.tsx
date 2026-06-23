"use client";

import type { HomeDashboardMetrics } from "@/lib/home/build-home-dashboard-metrics";
import type { LearningStreakSnapshot } from "@/lib/home/learning-streak";

type HomeDashboardHeroProps = {
  metrics: HomeDashboardMetrics;
  streak: LearningStreakSnapshot;
};

function formatMetric(value: number): string {
  return value.toLocaleString("en-US");
}

export function HomeDashboardHero({ metrics, streak }: HomeDashboardHeroProps) {
  const greeting = metrics.isReturning ? "Welcome back." : "Continue your Russian journey.";
  const russianGreeting = metrics.isReturning ? "Добро пожаловать." : "Начнём читать.";

  const motivation =
    metrics.wordsExplored > 0 || metrics.textsCompleted > 0
      ? [
          metrics.wordsExplored > 0
            ? `You have explored ${formatMetric(metrics.wordsExplored)} word${metrics.wordsExplored === 1 ? "" : "s"}.`
            : null,
          metrics.textsCompleted > 0
            ? `You have completed ${formatMetric(metrics.textsCompleted)} text${metrics.textsCompleted === 1 ? "" : "s"}.`
            : null,
        ]
          .filter(Boolean)
          .join(" ")
      : "Open a text, follow the words, and your workspace will fill with discoveries.";

  return (
    <section className="home-dash-hero" aria-labelledby="home-dash-greeting">
      <div className="home-dash-hero__intro">
        <p className="home-dash-hero__russian break-russian">{russianGreeting}</p>
        <h1 id="home-dash-greeting" className="home-dash-hero__title">
          {greeting}
        </h1>
        <p className="home-dash-hero__lead">{motivation}</p>
      </div>

      <aside className="home-dash-card home-dash-card--elevated home-dash-metrics" aria-label="Your progress">
        <p className="home-dash-metrics__label">Your workspace</p>
        <dl className="home-dash-metrics__grid">
          <div className="home-dash-metrics__item">
            <dt>Texts completed</dt>
            <dd>{formatMetric(metrics.textsCompleted)}</dd>
          </div>
          <div className="home-dash-metrics__item">
            <dt>Words discovered</dt>
            <dd>{formatMetric(metrics.wordsExplored)}</dd>
          </div>
          <div className="home-dash-metrics__item">
            <dt>Concepts explored</dt>
            <dd>{formatMetric(metrics.conceptsExplored)}</dd>
          </div>
          <div className="home-dash-metrics__item home-dash-metrics__item--accent">
            <dt>Current streak</dt>
            <dd>
              {formatMetric(metrics.currentStreak)}
              <span className="home-dash-metrics__unit">
                day{metrics.currentStreak === 1 ? "" : "s"}
              </span>
            </dd>
          </div>
        </dl>
        <ul className="home-dash-metrics__week" aria-label="Weekly activity">
          {streak.weeklyActivity.map((active, index) => (
            <li
              key={index}
              className={[
                "home-dash-metrics__day",
                active ? "home-dash-metrics__day--active" : "",
              ].join(" ")}
              aria-label={active ? "Active day" : "Inactive day"}
            />
          ))}
        </ul>
      </aside>
    </section>
  );
}
