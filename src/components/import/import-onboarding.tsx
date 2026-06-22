const OUTCOMES = [
  "une lecture annotée",
  "du vocabulaire structuré",
  "des concepts grammaticaux",
  "des exercices de pratique",
] as const;

export function ImportOnboarding() {
  return (
    <section className="import-onboarding" aria-labelledby="import-onboarding-heading">
      <h2 id="import-onboarding-heading" className="import-section-label">
        Commencer
      </h2>
      <div className="import-onboarding__card">
        <p className="import-onboarding__intro">
          Commencez par un court texte en russe — un article, un dialogue, un extrait de livre.
        </p>
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
