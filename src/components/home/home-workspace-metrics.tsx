import type { HomeDashboardMetrics } from "@/lib/home/build-home-dashboard-metrics";
import type { LearningStreakSnapshot } from "@/lib/home/learning-streak";

type HomeWorkspaceMetricsProps = {
  metrics: HomeDashboardMetrics;
  streak: LearningStreakSnapshot;
};

function formatMetric(value: number): string {
  return value.toLocaleString("en-US");
}

export function HomeWorkspaceMetrics({ metrics, streak }: HomeWorkspaceMetricsProps) {
  return (
    <div className="home-ws-metrics" aria-label="Workspace statistics">
      <article className="home-ws-card home-ws-card--metric home-ws-card--metric-streak">
        <p className="home-ws-metric__label">Current streak</p>
        <p className="home-ws-metric__value">
          {formatMetric(metrics.currentStreak)}
          <span className="home-ws-metric__unit">days</span>
        </p>
        <p className="home-ws-metric__hint">Keep your reading rhythm alive.</p>
      </article>

      <article className="home-ws-card home-ws-card--metric home-ws-card--metric-words">
        <p className="home-ws-metric__label">Words discovered</p>
        <p className="home-ws-metric__value">{formatMetric(metrics.wordsExplored)}</p>
        <div className="home-ws-metric__bars" aria-hidden>
          {[0.35, 0.55, 0.42, 0.7, 0.48, 0.62].map((height, index) => (
            <span key={index} style={{ height: `${height * 100}%` }} />
          ))}
        </div>
      </article>

      <article className="home-ws-card home-ws-card--metric">
        <p className="home-ws-metric__label">Concepts explored</p>
        <p className="home-ws-metric__value">{formatMetric(metrics.conceptsExplored)}</p>
      </article>

      <article className="home-ws-card home-ws-card--metric">
        <p className="home-ws-metric__label">Texts completed</p>
        <p className="home-ws-metric__value">{formatMetric(metrics.textsCompleted)}</p>
      </article>

      <article className="home-ws-card home-ws-card--metric home-ws-card--metric-activity">
        <p className="home-ws-metric__label">Daily activity</p>
        <p className="home-ws-metric__value home-ws-metric__value--small">
          {formatMetric(streak.wordsToday)}
          <span className="home-ws-metric__unit">words today</span>
        </p>
        <ul className="home-ws-metric__week" aria-label="Weekly activity">
          {streak.weeklyActivity.map((active, index) => (
            <li
              key={index}
              className={active ? "home-ws-metric__day home-ws-metric__day--active" : "home-ws-metric__day"}
            />
          ))}
        </ul>
      </article>
    </div>
  );
}
