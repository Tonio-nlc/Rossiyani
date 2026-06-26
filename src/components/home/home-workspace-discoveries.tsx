import { Card, TextButton } from "@/components/design-system";
import type { DiscoveryCard } from "@/lib/home/build-recent-discovery-chips";

type HomeWorkspaceDiscoveriesProps = {
  cards: DiscoveryCard[];
};

export function HomeWorkspaceDiscoveries({ cards }: HomeWorkspaceDiscoveriesProps) {
  return (
    <section className="home-ws-section" aria-labelledby="home-ws-discoveries-heading">
      <div className="home-ws-section__head">
        <h2 id="home-ws-discoveries-heading" className="r3-title home-ws-section__title">
          Recently discovered concepts
        </h2>
      </div>

      {cards.length === 0 ? (
        <Card className="home-ws-discovery-empty">
          <p className="r3-lead">Your discovery cards will appear here as you read and explore.</p>
          <TextButton href="/library" className="home-ws-discovery-empty__link">
            Open the library →
          </TextButton>
        </Card>
      ) : (
        <ul className="home-ws-discovery-grid">
          {cards.map((card) => (
            <li key={`${card.kind}-${card.label}`}>
              <Card
                href={card.href}
                className={["home-ws-discovery-card", `home-ws-discovery-card--${card.kind}`].join(" ")}
              >
                <span className="r3-eyebrow home-ws-discovery-card__type">{card.typeLabel}</span>
                <span className="home-ws-discovery-card__label break-russian">{card.label}</span>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
