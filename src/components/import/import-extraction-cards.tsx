import { EditorialSectionHead } from "@/components/editorial/editorial-section-head";

import {
  ImportIconCases,
  ImportIconConcepts,
  ImportIconEndings,
  ImportIconExtraction,
  ImportIconExpressions,
  ImportIconPractice,
  ImportIconWords,
} from "./import-extraction-icons";

const EXTRACTION_ITEMS = [
  {
    id: "words",
    title: "Mots",
    description: "Formes reliées à leurs lemmes pour le vocabulaire et la lecture.",
    Icon: ImportIconWords,
  },
  {
    id: "concepts",
    title: "Concepts",
    description: "Structures grammaticales et règles détectées dans le texte.",
    Icon: ImportIconConcepts,
  },
  {
    id: "cases",
    title: "Cas",
    description: "Déclinaisons et fonctions syntaxiques annotées en contexte.",
    Icon: ImportIconCases,
  },
  {
    id: "endings",
    title: "Terminaisons",
    description: "Formes fléchies, genres et paradigmes morphologiques.",
    Icon: ImportIconEndings,
  },
  {
    id: "expressions",
    title: "Expressions",
    description: "Tournures idiomatiques et formulations récurrentes.",
    Icon: ImportIconExpressions,
  },
  {
    id: "practice",
    title: "Pratique",
    description: "Exercices générés à partir des structures du texte.",
    Icon: ImportIconPractice,
  },
] as const;

export function ImportExtractionCards() {
  return (
    <section
      className="import-editorial-section import-editorial-section--secondary"
      aria-labelledby="import-extraction-heading"
    >
      <EditorialSectionHead
        id="import-extraction-heading"
        icon={<ImportIconExtraction className="editorial-section-head__icon" />}
        title="Ce que Rossiyani extrait"
        lead="Rossiyani analyse votre contenu et en tire un système d'apprentissage complet."
      />

      <ul className="import-feature-grid">
        {EXTRACTION_ITEMS.map((item) => (
          <li key={item.id}>
            <article className="import-feature-card">
              <span className="import-feature-card__icon-wrap" aria-hidden>
                <item.Icon className="import-feature-card__icon" />
              </span>
              <h3 className="import-feature-card__title">{item.title}</h3>
              <p className="import-feature-card__description">{item.description}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
