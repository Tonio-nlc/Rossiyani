import Link from "next/link";

import type { DiscoveryCard } from "@/lib/home/build-recent-discovery-chips";

type HomeWorkspaceDiscoveriesProps = {
  cards: DiscoveryCard[];
};

export function HomeWorkspaceDiscoveries({ cards }: HomeWorkspaceDiscoveriesProps) {
  return (
    <section className="home-ws-section" aria-labelledby="home-ws-discoveries-heading">
      <div className="home-ws-section__head">
        <h2 id="home-ws-discoveries-heading" className="home-ws-section__title">
          Recently discovered concepts
        </h2>
      </div>

      {cards.length === 0 ? (
        <div className="home-ws-card home-ws-discovery-empty">
          <p>Your discovery cards will appear here as you read and explore.</p>
          <Link href="/library" className="home-ws-discovery-empty__link focus-kb">
            Open the library →
          </Link>
        </div>
      ) : (
        <ul className="home-ws-discovery-grid">
          {cards.map((card) => (
            <li key={`${card.kind}-${card.label}`}>
              <Link
                href={card.href}
                className={[
                  "home-ws-card",
                  "home-ws-discovery-card",
                  `home-ws-discovery-card--${card.kind}`,
                  "focus-kb",
                ].join(" ")}
              >
                <span className="home-ws-discovery-card__type">{card.typeLabel}</span>
                <span className="home-ws-discovery-card__label break-russian">{card.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
