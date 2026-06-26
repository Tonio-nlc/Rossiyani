import { Card } from "@/components/design-system";

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
    <section className="home-ws-section" aria-labelledby="import-preview-heading">
      <div className="home-ws-section__head">
        <h2 id="import-preview-heading" className="r3-title home-ws-section__title">
          Exemple d&apos;analyse
        </h2>
        <p className="r3-lead home-ws-section__subtitle">
          Voici le type de découvertes que Rossiyani génère à partir d&apos;un texte.
        </p>
      </div>

      <ul className="home-ws-sample-grid">
        {PREVIEW_ITEMS.map((item) => (
          <li key={item.id}>
            <Card as="article" className="home-ws-sample-card">
              <p className="r3-eyebrow home-ws-sample-card__kind">{item.kind}</p>
              <h3 className="r3-title home-ws-sample-card__title break-russian font-reader">
                {item.title}
              </h3>
              <p className="home-ws-sample-card__subtitle">{item.subtitle}</p>
              <p className="home-ws-sample-card__detail">{item.detail}</p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
