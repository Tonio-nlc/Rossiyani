import Link from "next/link";

import type { DiscoveryChip } from "@/lib/home/build-recent-discovery-chips";

type HomeDashboardDiscoveriesProps = {
  chips: DiscoveryChip[];
};

const KIND_LABELS: Record<DiscoveryChip["kind"], string> = {
  word: "Word",
  concept: "Concept",
  grammar: "Grammar",
};

export function HomeDashboardDiscoveries({ chips }: HomeDashboardDiscoveriesProps) {
  if (chips.length === 0) {
    return (
      <section className="home-dash-section" aria-labelledby="home-dash-discoveries-heading">
        <div className="home-dash-section__head">
          <h2 id="home-dash-discoveries-heading" className="home-dash-section__title">
            Recent discoveries
          </h2>
          <p className="home-dash-section__lead">
            Words, concepts, and patterns will appear here as you read and explore.
          </p>
        </div>
        <div className="home-dash-card home-dash-discoveries-empty">
          <p>Start reading to build your discovery trail.</p>
          <Link href="/library" className="home-dash-discoveries-empty__link focus-kb">
            Open the library →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="home-dash-section" aria-labelledby="home-dash-discoveries-heading">
      <div className="home-dash-section__head">
        <h2 id="home-dash-discoveries-heading" className="home-dash-section__title">
          Recent discoveries
        </h2>
        <p className="home-dash-section__lead">Recently explored words, concepts, and grammar.</p>
      </div>

      <ul className="home-dash-discoveries">
        {chips.map((chip) => (
          <li key={`${chip.kind}-${chip.label}`}>
            <Link
              href={chip.href}
              className={[
                "home-dash-chip",
                `home-dash-chip--${chip.kind}`,
                "focus-kb",
                "break-russian",
              ].join(" ")}
            >
              <span className="home-dash-chip__kind">{KIND_LABELS[chip.kind]}</span>
              <span className="home-dash-chip__label">{chip.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
