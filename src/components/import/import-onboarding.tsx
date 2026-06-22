import { EditorialSectionHead } from "@/components/editorial/editorial-section-head";

import { ImportIconWords } from "./import-extraction-icons";

const OUTCOMES = [
  "une lecture annotée",
  "du vocabulaire structuré",
  "des concepts grammaticaux",
  "des exercices de pratique",
] as const;

export function ImportOnboarding() {
  return (
    <section
      className="import-editorial-section"
      aria-labelledby="import-onboarding-heading"
    >
      <EditorialSectionHead
        id="import-onboarding-heading"
        icon={<ImportIconWords className="editorial-section-head__icon" />}
        title="Commencer"
        lead="Commencez par un court texte en russe — un article, un dialogue, un extrait de livre."
      />

      <div className="import-onboarding__card">
        <p className="import-onboarding__lead">Chaque texte importé devient&nbsp;:</p>
        <ul className="import-onboarding__list">
          {OUTCOMES.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
