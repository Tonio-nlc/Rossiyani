import { GhostButton } from "@/components/design-system";
import { EditorialSectionHead } from "@/components/editorial/editorial-section-head";

import { HomeIconManual } from "./home-icons";

export function HomeManualSection() {
  return (
    <section className="home-section" aria-labelledby="home-manual-heading">
      <EditorialSectionHead
        id="home-manual-heading"
        icon={<HomeIconManual className="editorial-section-head__icon" />}
        title="The Scholar&apos;s Manual"
        lead="Structured teaching that complements discovery — morphology, syntax and the six-case system presented as a coherent framework."
      />

      <div className="home-manual-card">
        <p className="home-manual-card__text">
          When you need architecture, not just examples — the Manual provides rigorous grammar
          lessons that deepen what you encounter in reading.
        </p>
        <GhostButton href="/manual">Open Manual →</GhostButton>
      </div>
    </section>
  );
}
