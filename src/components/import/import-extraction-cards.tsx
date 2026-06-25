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
    accent: "words",
  },
  {
    id: "concepts",
    title: "Concepts",
    description: "Structures grammaticales et règles détectées dans le texte.",
    Icon: ImportIconConcepts,
    accent: "concepts",
  },
  {
    id: "cases",
    title: "Cas",
    description: "Déclinaisons et fonctions syntaxiques annotées en contexte.",
    Icon: ImportIconCases,
    accent: "cases",
  },
  {
    id: "endings",
    title: "Terminaisons",
    description: "Formes fléchies, genres et paradigmes morphologiques.",
    Icon: ImportIconEndings,
    accent: "endings",
  },
  {
    id: "expressions",
    title: "Expressions",
    description: "Tournures idiomatiques et formulations récurrentes.",
    Icon: ImportIconExpressions,
    accent: "expressions",
  },
  {
    id: "practice",
    title: "Pratique",
    description: "Exercices générés à partir des structures du texte.",
    Icon: ImportIconPractice,
    accent: "practice",
  },
] as const;

export function ImportExtractionCards() {
  return (
    <section className="import-ws-section" aria-labelledby="import-extraction-heading">
      <div className="import-ws-section__head">
        <h2 id="import-extraction-heading" className="import-ws-section__title">
          Ce que Rossiyani crée
        </h2>
        <p className="import-ws-section__lead">
          Rossiyani analyse votre contenu et en tire un système d&apos;apprentissage complet.
        </p>
      </div>

      <ul className="import-ws-features">
        {EXTRACTION_ITEMS.map((item) => (
          <li key={item.id}>
            <article className={`import-ws-feature import-ws-feature--${item.accent}`}>
              <item.Icon className="import-ws-feature__icon" aria-hidden />
              <h3 className="import-ws-feature__title">{item.title}</h3>
              <p className="import-ws-feature__description">{item.description}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
