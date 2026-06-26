import Link from "next/link";

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
        <h2 id="home-ws-vocabulary-heading" className="home-ws-section__title home-ws-section__title--secondary">
          Vocabulary
        </h2>
      </div>

      <div className="home-ws-explore-hub">
        <div className="home-ws-explore-hub__main">
          <article className="home-ws-card home-ws-explore-hub__explorer">
            <div className="home-ws-explore-hub__explorer-head">
              <span className="home-ws-explore-hub__icon" aria-hidden>
                <HomeIconExplore className="home-ws-explore-hub__icon-svg" />
              </span>
              <h3 className="home-ws-explore-hub__card-title">Vocabulary</h3>
            </div>
            <p className="home-ws-explore-hub__description">
              Retrouvez vos mots, expressions et phrases sauvegardées — votre mémoire linguistique
              personnelle.
            </p>
            <Link href={vocabularyPath()} className="home-ws-explore-hub__cta focus-kb">
              Ouvrir Vocabulary
            </Link>
          </article>

          <div className="home-ws-explore-hub__side">
            <article className="home-ws-card home-ws-explore-hub__side-card">
              <div className="home-ws-explore-hub__side-head">
                <span className="home-ws-explore-hub__icon home-ws-explore-hub__icon--small" aria-hidden>
                  <HomeIconRead className="home-ws-explore-hub__icon-svg" />
                </span>
                <h3 className="home-ws-explore-hub__card-title">Mots</h3>
              </div>
              <p className="home-ws-explore-hub__metric">
                {formatCount(hub.savedWordCount)} mot{hub.savedWordCount === 1 ? "" : "s"} appris
              </p>
              <Link href={vocabularyPath("words")} className="home-ws-explore-hub__link focus-kb">
                Voir les mots →
              </Link>
            </article>

            <article className="home-ws-card home-ws-explore-hub__side-card">
              <div className="home-ws-explore-hub__side-head">
                <span className="home-ws-explore-hub__icon home-ws-explore-hub__icon--small" aria-hidden>
                  <HomeIconManual className="home-ws-explore-hub__icon-svg" />
                </span>
                <h3 className="home-ws-explore-hub__card-title">Leçons</h3>
              </div>
              <p className="home-ws-explore-hub__metric">
                {formatCount(hub.manualProgress.completed)} / {formatCount(hub.manualProgress.total)} lessons
                <span className="home-ws-explore-hub__metric-muted"> · {hub.manualProgress.percent}% roadmap</span>
              </p>
              <Link href="/lessons" className="home-ws-explore-hub__link focus-kb">
                Continue learning →
              </Link>
            </article>
          </div>
        </div>

        <article className="home-ws-explore-hub__recent" aria-label="Accès rapide">
          <p className="home-ws-explore-hub__recent-label">Accès rapide</p>
          <ul className="home-ws-explore-hub__recent-list">
            <li className="home-ws-explore-hub__recent-item">
              <span className="home-ws-explore-hub__recent-kind">Words</span>
              <Link href={vocabularyPath("words")} className="home-ws-explore-hub__recent-value focus-kb">
                {formatCount(hub.savedWordCount)} mots
              </Link>
            </li>
            <li className="home-ws-explore-hub__recent-item">
              <span className="home-ws-explore-hub__recent-kind">Sentences</span>
              <Link href={vocabularyPath("sentences")} className="home-ws-explore-hub__recent-value focus-kb">
                Phrases sauvegardées
              </Link>
            </li>
            <li className="home-ws-explore-hub__recent-item">
              <span className="home-ws-explore-hub__recent-kind">Expressions</span>
              <Link href={vocabularyPath("expressions")} className="home-ws-explore-hub__recent-value focus-kb">
                Expressions
              </Link>
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}
