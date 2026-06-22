import { EditorialSectionHead } from "@/components/editorial/editorial-section-head";

import { ImportIconPreview } from "./import-extraction-icons";

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
    <section
      className="import-editorial-section import-editorial-section--secondary"
      aria-labelledby="import-preview-heading"
    >
      <EditorialSectionHead
        id="import-preview-heading"
        icon={<ImportIconPreview className="editorial-section-head__icon" />}
        title="Aperçu de l'analyse"
        lead="Voici le type de découvertes que Rossiyani génère à partir d'un texte."
      />

      <ul className="import-preview-grid">
        {PREVIEW_ITEMS.map((item) => (
          <li key={item.id}>
            <article className="import-preview-card">
              <p className="import-preview-card__kind">{item.kind}</p>
              <h3 className="import-preview-card__title">{item.title}</h3>
              <p className="import-preview-card__subtitle">{item.subtitle}</p>
              <p className="import-preview-card__detail">{item.detail}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
