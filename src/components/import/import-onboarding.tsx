export function ImportOnboarding() {
  const OUTCOMES = [
    "une lecture annotée",
    "du vocabulaire structuré",
    "des concepts grammaticaux",
    "des exercices de pratique",
  ] as const;

  return (
    <section className="import-ws-section" aria-labelledby="import-onboarding-heading">
      <div className="import-ws-section__head">
        <h2 id="import-onboarding-heading" className="import-ws-section__title">
          Commencer
        </h2>
        <p className="import-ws-section__lead">
          Commencez par un court texte en russe — un article, un dialogue, un extrait de livre.
        </p>
      </div>

      <div className="import-ws-onboarding-card">
        <p className="import-ws-onboarding-card__lead">
          Chaque texte importé devient&nbsp;:
        </p>
        <ul className="import-onboarding__list">
          {OUTCOMES.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
