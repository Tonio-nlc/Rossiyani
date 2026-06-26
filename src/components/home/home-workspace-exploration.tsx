import { Card, PrimaryButton, TextButton } from "@/components/design-system";
import type { ExplorationHubData } from "@/lib/home/build-exploration-hub";
import { vocabularyPath } from "@/lib/vocabulary";

import { HomeIconExplore, HomeIconManual, HomeIconRead } from "./home-icons";

type HomeWorkspaceExplorationProps = {
  hub: ExplorationHubData;
};

function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export function HomeWorkspaceExploration({ hub }: HomeWorkspaceExplorationProps) {
  return (
    <section
      className="home-ws-section home-ws-section--secondary"
      aria-labelledby="home-ws-vocabulary-heading"
    >
      <div className="home-ws-section__head home-ws-section__head--compact">
        <h2
          id="home-ws-vocabulary-heading"
          className="r3-title home-ws-section__title home-ws-section__title--secondary"
        >
          Vocabulary
        </h2>
      </div>

      <div className="home-ws-explore-hub">
        <div className="home-ws-explore-hub__main">
          <Card as="article" className="home-ws-explore-hub__explorer">
            <div className="home-ws-explore-hub__explorer-head">
              <span className="home-ws-explore-hub__icon" aria-hidden>
                <HomeIconExplore className="home-ws-explore-hub__icon-svg" />
              </span>
              <h3 className="r3-title home-ws-explore-hub__card-title">Vocabulary</h3>
            </div>
            <p className="r3-lead home-ws-explore-hub__description">
              Retrouvez vos mots, expressions et phrases sauvegardées — votre mémoire linguistique
              personnelle.
            </p>
            <PrimaryButton href={vocabularyPath()} className="home-ws-explore-hub__cta">
              Ouvrir Vocabulary
            </PrimaryButton>
          </Card>

          <div className="home-ws-explore-hub__side">
            <Card as="article" className="home-ws-explore-hub__side-card">
              <div className="home-ws-explore-hub__side-head">
                <span className="home-ws-explore-hub__icon home-ws-explore-hub__icon--small" aria-hidden>
                  <HomeIconRead className="home-ws-explore-hub__icon-svg" />
                </span>
                <h3 className="r3-title home-ws-explore-hub__card-title">Mots</h3>
              </div>
              <p className="home-ws-explore-hub__metric">
                {formatCount(hub.savedWordCount)} mot{hub.savedWordCount === 1 ? "" : "s"} appris
              </p>
              <TextButton href={vocabularyPath("words")} className="home-ws-explore-hub__link">
                Voir les mots →
              </TextButton>
            </Card>

            <Card as="article" className="home-ws-explore-hub__side-card">
              <div className="home-ws-explore-hub__side-head">
                <span className="home-ws-explore-hub__icon home-ws-explore-hub__icon--small" aria-hidden>
                  <HomeIconManual className="home-ws-explore-hub__icon-svg" />
                </span>
                <h3 className="r3-title home-ws-explore-hub__card-title">Leçons</h3>
              </div>
              <p className="home-ws-explore-hub__metric">
                {formatCount(hub.manualProgress.completed)} / {formatCount(hub.manualProgress.total)} lessons
                <span className="home-ws-explore-hub__metric-muted"> · {hub.manualProgress.percent}% roadmap</span>
              </p>
              <TextButton href="/lessons" className="home-ws-explore-hub__link">
                Continue learning →
              </TextButton>
            </Card>
          </div>
        </div>

        <Card as="article" className="home-ws-explore-hub__recent" aria-label="Accès rapide">
          <p className="home-ws-explore-hub__recent-label">Accès rapide</p>
          <ul className="home-ws-explore-hub__recent-list">
            <li className="home-ws-explore-hub__recent-item">
              <span className="home-ws-explore-hub__recent-kind">Words</span>
              <TextButton href={vocabularyPath("words")} className="home-ws-explore-hub__recent-value">
                {formatCount(hub.savedWordCount)} mots
              </TextButton>
            </li>
            <li className="home-ws-explore-hub__recent-item">
              <span className="home-ws-explore-hub__recent-kind">Sentences</span>
              <TextButton href={vocabularyPath("sentences")} className="home-ws-explore-hub__recent-value">
                Phrases sauvegardées
              </TextButton>
            </li>
            <li className="home-ws-explore-hub__recent-item">
              <span className="home-ws-explore-hub__recent-kind">Expressions</span>
              <TextButton href={vocabularyPath("expressions")} className="home-ws-explore-hub__recent-value">
                Expressions
              </TextButton>
            </li>
          </ul>
        </Card>
      </div>
    </section>
  );
}
