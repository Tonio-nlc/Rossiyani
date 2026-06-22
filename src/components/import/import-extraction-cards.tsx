const EXTRACTION_ITEMS = [
  {
    id: "lemmas",
    title: "Mots et lemmes",
    description: "Chaque forme est reliée à sa base lexicale pour le vocabulaire et la lecture.",
  },
  {
    id: "concepts",
    title: "Concepts grammaticaux",
    description: "Temps, aspects, structures et règles détectés dans le texte.",
  },
  {
    id: "cases",
    title: "Cas et terminaisons",
    description: "Déclinaisons, genres et formes fléchies annotées en contexte.",
  },
  {
    id: "collocations",
    title: "Collocations",
    description: "Associations naturelles entre mots, prêtes à explorer.",
  },
  {
    id: "expressions",
    title: "Expressions",
    description: "Tournures idiomatiques et formulations récurrentes.",
  },
  {
    id: "practice",
    title: "Matériel de pratique",
    description: "Exercices générés à partir des structures du texte.",
  },
] as const;

export function ImportExtractionCards() {
  return (
    <section className="import-extraction" aria-labelledby="import-extraction-heading">
      <h2 id="import-extraction-heading" className="import-section-label">
        Ce que Rossiyani extrait
      </h2>
      <p className="import-extraction__lead">
        Rossiyani analyse votre contenu et en tire un système d&apos;apprentissage complet.
      </p>
      <ul className="import-extraction-grid">
        {EXTRACTION_ITEMS.map((item) => (
          <li key={item.id}>
            <article className="import-extraction-card">
              <span className="import-extraction-card__check" aria-hidden>
                ✓
              </span>
              <div className="import-extraction-card__body">
                <h3 className="import-extraction-card__title">{item.title}</h3>
                <p className="import-extraction-card__description">{item.description}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
