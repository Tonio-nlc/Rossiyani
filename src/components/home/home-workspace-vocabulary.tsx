import { Badge, Card, PrimaryButton } from "@/components/design-system";
import type { ExplorationHubData } from "@/lib/home/build-exploration-hub";
import { vocabularyPath } from "@/lib/vocabulary";

type HomeWorkspaceVocabularyProps = {
  hub: ExplorationHubData;
};

export function HomeWorkspaceVocabulary({ hub }: HomeWorkspaceVocabularyProps) {
  return (
    <section className="lessons-section" aria-labelledby="home-vocabulary-heading">
      <div className="lessons-section__head">
        <h2 id="home-vocabulary-heading" className="r3-title lessons-section__title">
          Vocabulary
        </h2>
      </div>

      <Card as="article" interactive className="lessons-continue ws-card home-ws-vocabulary-strip">
        <div className="ws-card__body">
          <p className="lessons-continue__label ws-card__eyebrow">Mémoire linguistique</p>
          <p className="r3-title lessons-continue__title ws-card__title">
            Vos mots, expressions et phrases
          </p>
          <p className="lessons-continue__meta ws-card__desc">
            {hub.savedWordCount} mot{hub.savedWordCount === 1 ? "" : "s"} sauvegardé
            {hub.savedWordCount === 1 ? "" : "s"}
            {hub.manualProgress.total > 0
              ? ` · ${hub.manualProgress.completed}/${hub.manualProgress.total} leçons lues`
              : ""}
          </p>
          <div className="ws-card__meta lessons-hero__metrics">
            <Badge tone="violet">Mots</Badge>
            <Badge tone="neutral">Expressions</Badge>
            <Badge tone="green">Phrases</Badge>
          </div>
        </div>
        <footer className="ws-card__footer">
          <PrimaryButton href={vocabularyPath()} className="lessons-continue__cta">
            Ouvrir Vocabulary →
          </PrimaryButton>
        </footer>
      </Card>
    </section>
  );
}
