import Link from "next/link";

import type { ExplorationHubData } from "@/lib/home/build-exploration-hub";

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
      aria-labelledby="home-ws-explore-heading"
    >
      <div className="home-ws-section__head home-ws-section__head--compact">
        <h2 id="home-ws-explore-heading" className="home-ws-section__title home-ws-section__title--secondary">
          Continue exploration
        </h2>
      </div>

      <div className="home-ws-explore-hub">
        <div className="home-ws-explore-hub__main">
          <article className="home-ws-card home-ws-explore-hub__explorer">
            <div className="home-ws-explore-hub__explorer-head">
              <span className="home-ws-explore-hub__icon" aria-hidden>
                <HomeIconExplore className="home-ws-explore-hub__icon-svg" />
              </span>
              <h3 className="home-ws-explore-hub__card-title">Explorer</h3>
            </div>
            <p className="home-ws-explore-hub__description">
              Discover lemmas, grammar patterns, concepts and connections between words.
            </p>
            <Link href="/explorer" className="home-ws-explore-hub__cta focus-kb">
              Explore now
            </Link>
          </article>

          <div className="home-ws-explore-hub__side">
            <article className="home-ws-card home-ws-explore-hub__side-card">
              <div className="home-ws-explore-hub__side-head">
                <span className="home-ws-explore-hub__icon home-ws-explore-hub__icon--small" aria-hidden>
                  <HomeIconRead className="home-ws-explore-hub__icon-svg" />
                </span>
                <h3 className="home-ws-explore-hub__card-title">Saved Words</h3>
              </div>
              <p className="home-ws-explore-hub__metric">
                {formatCount(hub.savedWordCount)} saved word{hub.savedWordCount === 1 ? "" : "s"}
              </p>
              <Link href="/library?section=discoveries" className="home-ws-explore-hub__link focus-kb">
                Quick review →
              </Link>
            </article>

            <article className="home-ws-card home-ws-explore-hub__side-card">
              <div className="home-ws-explore-hub__side-head">
                <span className="home-ws-explore-hub__icon home-ws-explore-hub__icon--small" aria-hidden>
                  <HomeIconManual className="home-ws-explore-hub__icon-svg" />
                </span>
                <h3 className="home-ws-explore-hub__card-title">Manual</h3>
              </div>
              <p className="home-ws-explore-hub__metric">
                {formatCount(hub.manualProgress.completed)} / {formatCount(hub.manualProgress.total)} lessons
                <span className="home-ws-explore-hub__metric-muted"> · {hub.manualProgress.percent}% roadmap</span>
              </p>
              <Link href="/manual" className="home-ws-explore-hub__link focus-kb">
                Continue learning →
              </Link>
            </article>
          </div>
        </div>

        <article className="home-ws-explore-hub__recent" aria-label="Recent discoveries">
          <p className="home-ws-explore-hub__recent-label">Recent discoveries</p>
          <ul className="home-ws-explore-hub__recent-list">
            {hub.recentDiscoveries.map((item) => (
              <li key={item.category} className="home-ws-explore-hub__recent-item">
                <span className="home-ws-explore-hub__recent-kind">{item.categoryLabel}</span>
                {item.href ? (
                  <Link href={item.href} className="home-ws-explore-hub__recent-value focus-kb break-russian">
                    {item.label}
                  </Link>
                ) : (
                  <span className="home-ws-explore-hub__recent-value home-ws-explore-hub__recent-value--empty">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
