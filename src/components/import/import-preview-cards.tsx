const PREVIEW_ITEMS = [
  {
    id: "word",
    kind: "Mot",
    title: "встреча",
    subtitle: "Nom · féminin · prépositionnel встрече",
    detail: "Rencontré 3 fois dans le texte · lié au lemme встреча",
  },
  {
    id: "concept",
    kind: "Concept",
    title: "Prépositionnel après в",
    subtitle: "Cas · lieu abstrait",
    detail: "Contexte : « думать о встрече » — penser à la rencontre",
  },
  {
    id: "expression",
    kind: "Expression",
    title: "как дела?",
    subtitle: "Formule courante",
    detail: "Salutation informelle · prête pour la pratique",
  },
] as const;

export function ImportPreviewCards() {
  return (
    <section className="import-ws-section" aria-labelledby="import-preview-heading">
      <div className="import-ws-section__head">
        <h2 id="import-preview-heading" className="import-ws-section__title">
          Exemple d&apos;analyse
        </h2>
        <p className="import-ws-section__lead">
          Voici le type de découvertes que Rossiyani génère à partir d&apos;un texte.
        </p>
      </div>

      <ul className="import-ws-preview">
        {PREVIEW_ITEMS.map((item) => (
          <li key={item.id}>
            <article className="import-ws-preview-card">
              <p className="import-ws-preview-card__kind">{item.kind}</p>
              <h3 className="import-ws-preview-card__title break-russian">{item.title}</h3>
              <p className="import-ws-preview-card__subtitle">{item.subtitle}</p>
              <p className="import-ws-preview-card__detail">{item.detail}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
