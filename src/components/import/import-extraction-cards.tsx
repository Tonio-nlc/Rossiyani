import { Card } from "@/components/design-system";

import {
  ImportIconCases,
  ImportIconConcepts,
  ImportIconEndings,
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
    <section className="home-ws-section" aria-labelledby="import-extraction-heading">
      <div className="home-ws-section__head">
        <h2 id="import-extraction-heading" className="r3-title home-ws-section__title">
          Ce que Rossiyani crée
        </h2>
        <p className="r3-lead home-ws-section__subtitle">
          Rossiyani analyse votre contenu et en tire un système d&apos;apprentissage complet.
        </p>
      </div>

      <ul className="home-ws-feature-grid">
        {EXTRACTION_ITEMS.map((item) => (
          <li key={item.id}>
            <Card as="article" className="home-ws-feature-tile">
              <div className="home-ws-feature-tile__head">
                <span className="home-ws-explore-hub__icon" aria-hidden>
                  <item.Icon className="home-ws-explore-hub__icon-svg" />
                </span>
                <h3 className="r3-title home-ws-feature-tile__title">{item.title}</h3>
              </div>
              <p className="r3-lead home-ws-explore-hub__description">{item.description}</p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
