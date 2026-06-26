import type { VocabularyExpression } from "@/lib/vocabulary";

import { VocabularyEmptyState } from "./vocabulary-empty-state";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function VocabularyExpressionCard({ expression }: { expression: VocabularyExpression }) {
  return (
    <article className="vocabulary-card">
      <p className="vocabulary-card__russian break-russian">{expression.russian}</p>
      {expression.translation ? (
        <p className="vocabulary-card__translation">{expression.translation}</p>
      ) : null}
      {expression.meaning ? <p className="vocabulary-card__meaning">{expression.meaning}</p> : null}
      {expression.exampleRussian ? (
        <blockquote className="vocabulary-card__example">
          <p className="vocabulary-card__example-russian break-russian">{expression.exampleRussian}</p>
          {expression.exampleTranslation ? <p>{expression.exampleTranslation}</p> : null}
        </blockquote>
      ) : null}
      <div className="vocabulary-card__meta">
        <span className="vocabulary-tag vocabulary-tag--level">{expression.level}</span>
        <span className="vocabulary-tag">Expression</span>
      </div>
      <footer className="vocabulary-card__footer">
        <p className="vocabulary-card__date">Ajoutée le {formatDate(expression.savedAt)}</p>
      </footer>
    </article>
  );
}

type VocabularyExpressionsPanelProps = {
  expressions: VocabularyExpression[];
};

export function VocabularyExpressionsPanel({ expressions }: VocabularyExpressionsPanelProps) {
  return (
    <section className="vocabulary-panel" aria-labelledby="vocabulary-expressions-heading">
      <div className="vocabulary-panel__head">
        <h2 id="vocabulary-expressions-heading" className="vocabulary-panel__title">
          Expressions
        </h2>
        <p className="vocabulary-panel__subtitle">
          Unités complètes à part entière — sens réel, variantes et contextes d&apos;usage, jamais
          réduites à une simple liste de mots.
        </p>
      </div>

      {expressions.length === 0 ? (
        <VocabularyEmptyState
          title="Aucune expression enregistrée"
          lead="Les expressions que vous sauvegardez depuis vos découvertes apparaîtront ici comme des fiches autonomes."
          ctaHref="/reader"
          ctaLabel="Lire et découvrir →"
        />
      ) : (
        <ul className="vocabulary-grid vocabulary-grid--expressions">
          {expressions.map((expression) => (
            <li key={expression.id}>
              <VocabularyExpressionCard expression={expression} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
