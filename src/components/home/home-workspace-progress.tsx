import type { HomeProgressSnapshot } from "@/lib/home/build-home-session";

type HomeWorkspaceProgressProps = {
  progress: HomeProgressSnapshot;
};

export function HomeWorkspaceProgress({ progress }: HomeWorkspaceProgressProps) {
  const items = [
    progress.textsCompleted > 0
      ? { label: "Textes terminés", value: String(progress.textsCompleted) }
      : null,
    progress.wordsLearned > 0
      ? { label: "Mots appris", value: String(progress.wordsLearned) }
      : null,
    progress.cardsMastered > 0
      ? { label: "Cartes maîtrisées", value: String(progress.cardsMastered) }
      : null,
    progress.currentStreak > 0
      ? {
          label: "Série",
          value: `${progress.currentStreak} j`,
        }
      : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="home-ws-progress" aria-labelledby="home-progress-heading">
      <h2 id="home-progress-heading" className="home-ws-progress__title">
        Progression
      </h2>
      <dl className="home-ws-progress__grid">
        {items.map((item) => (
          <div key={item.label} className="home-ws-progress__item">
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
