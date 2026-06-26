import { Card } from "@/components/design-system";

export function ImportOnboarding() {
  const OUTCOMES = [
    "une lecture annotée",
    "du vocabulaire structuré",
    "des concepts grammaticaux",
    "des exercices de pratique",
  ] as const;

  return (
    <section className="home-ws-section" aria-labelledby="import-onboarding-heading">
      <div className="home-ws-section__head">
        <h2 id="import-onboarding-heading" className="r3-title home-ws-section__title">
          Commencer
        </h2>
        <p className="r3-lead home-ws-section__subtitle">
          Commencez par un court texte en russe — un article, un dialogue, un extrait de livre.
        </p>
      </div>

      <Card className="home-ws-onboarding-card">
        <p className="r3-lead home-ws-onboarding-card__intro">
          Chaque texte importé devient&nbsp;:
        </p>
        <ul className="home-ws-onboarding-card__list">
          {OUTCOMES.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
