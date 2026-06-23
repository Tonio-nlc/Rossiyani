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
      <article className="home-ws-card home-ws-card--metric home-ws-card--surface-cream home-ws-metric-streak">
        <p className="home-ws-metric__label">Current streak</p>
        <p className="home-ws-metric__value home-ws-metric__value--hero">
          {formatMetric(metrics.currentStreak)}
          <span className="home-ws-metric__unit">days</span>
        </p>
      </article>

      <article className="home-ws-card home-ws-card--metric home-ws-card--surface-pearl home-ws-metric-progress">
        <p className="home-ws-metric__label">Learning progress</p>
        <dl className="home-ws-metric-progress__grid">
          <div>
            <dt>Words</dt>
            <dd>{formatMetric(metrics.wordsExplored)}</dd>
          </div>
          <div>
            <dt>Concepts</dt>
            <dd>{formatMetric(metrics.conceptsExplored)}</dd>
          </div>
          <div>
            <dt>Texts</dt>
            <dd>{formatMetric(metrics.textsCompleted)}</dd>
          </div>
        </dl>
      </article>

      <article className="home-ws-card home-ws-card--metric home-ws-card--surface-beige home-ws-metric-activity">
        <p className="home-ws-metric__label">Daily activity</p>
        <p className="home-ws-metric__value home-ws-metric__value--compact">
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
