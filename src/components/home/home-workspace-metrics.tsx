import { buildWordsMilestone } from "@/lib/home/build-hero-continue-insights";
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
  const milestone = buildWordsMilestone(metrics.wordsExplored);

  return (
    <div className="home-ws-metrics" aria-label="Learning statistics">
      <article className="home-ws-card home-ws-metric">
        <p className="home-ws-metric__label">Current Streak</p>
        <p className="home-ws-metric__value home-ws-metric__value--accent">
          {formatMetric(metrics.currentStreak)}
          <span className="home-ws-metric__unit">days</span>
        </p>
        <p className="home-ws-metric__hint">Keep your reading rhythm alive.</p>
      </article>

      <article className="home-ws-card home-ws-metric home-ws-metric--milestone">
        <p className="home-ws-metric__label">Next Milestone</p>
        <p className="home-ws-metric__goal-title">100 Words Goal</p>
        <p className="home-ws-metric__goal-progress">
          {formatMetric(milestone.current)} / {formatMetric(milestone.goal)}
        </p>
        <div className="home-ws-metric__goal-track" aria-hidden>
          <div
            className="home-ws-metric__goal-fill"
            style={{ width: `${milestone.percent}%` }}
          />
        </div>
        <p className="home-ws-metric__hint">
          {milestone.remaining > 0
            ? `${formatMetric(milestone.remaining)} words remaining`
            : "Milestone reached — set your sights higher."}
        </p>
      </article>

      <article className="home-ws-card home-ws-metric">
        <p className="home-ws-metric__label">Learning Progress</p>
        <dl className="home-ws-metric-progress__grid">
          <div>
            <dt>words</dt>
            <dd>{formatMetric(metrics.wordsExplored)}</dd>
          </div>
          <div>
            <dt>concepts</dt>
            <dd>{formatMetric(metrics.conceptsExplored)}</dd>
          </div>
          <div>
            <dt>texts</dt>
            <dd>{formatMetric(metrics.textsCompleted)}</dd>
          </div>
        </dl>
      </article>

      <article className="home-ws-card home-ws-metric">
        <p className="home-ws-metric__label">Daily Activity</p>
        <p className="home-ws-metric__value">
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
