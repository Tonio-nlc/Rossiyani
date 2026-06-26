import { GhostButton } from "@/components/design-system";
import { EditorialSectionHead } from "@/components/editorial/editorial-section-head";

import { HomeIconManual } from "./home-icons";

export function HomeManualSection() {
  return (
    <section className="home-section" aria-labelledby="home-lessons-heading">
      <EditorialSectionHead
        id="home-lessons-heading"
        icon={<HomeIconManual className="editorial-section-head__icon" />}
        title="Leçons"
        lead="Grammaire, vocabulaire et culture — un parcours structuré qui complète votre lecture."
      />

      <div className="home-manual-card">
        <p className="home-manual-card__text">
          Quand vous avez besoin de structure, pas seulement d&apos;exemples — les leçons approfondissent
          ce que vous rencontrez en lecture.
        </p>
        <GhostButton href="/lessons">Ouvrir les leçons →</GhostButton>
      </div>
    </section>
  );
}
