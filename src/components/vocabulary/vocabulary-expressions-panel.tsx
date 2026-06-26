import type { VocabularyExpression } from "@/lib/vocabulary";

import { VocabularyEmptyState } from "./vocabulary-empty-state";
import { VocabularyExpressionFiche } from "./vocabulary-expression-fiche";

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
          Unités complètes à part entière — sens réel, variantes et contextes d&apos;usage.
        </p>
      </div>

      {expressions.length === 0 ? (
        <VocabularyEmptyState
          title="Aucune expression enregistrée"
          lead="Les expressions que vous sauvegardez depuis vos découvertes apparaîtront ici."
          ctaHref="/reader"
          ctaLabel="Lire et découvrir →"
          tone="expressions"
        />
      ) : (
        <ul className="vocabulary-grid vocabulary-grid--expressions">
          {expressions.map((expression) => (
            <VocabularyExpressionFiche key={expression.id} expression={expression} />
          ))}
        </ul>
      )}
    </section>
  );
}
