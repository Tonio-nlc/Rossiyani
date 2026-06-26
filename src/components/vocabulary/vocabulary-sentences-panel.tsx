import type { VocabularySentence } from "@/lib/vocabulary";

import { VocabularyEmptyState } from "./vocabulary-empty-state";
import { VocabularySentenceFiche } from "./vocabulary-sentence-fiche";

type VocabularySentencesPanelProps = {
  sentences: VocabularySentence[];
};

export function VocabularySentencesPanel({ sentences }: VocabularySentencesPanelProps) {
  return (
    <section className="vocabulary-panel" aria-labelledby="vocabulary-sentences-heading">
      <div className="vocabulary-panel__head">
        <h2 id="vocabulary-sentences-heading" className="vocabulary-panel__title">
          Phrases sauvegardées
        </h2>
        <p className="vocabulary-panel__subtitle">
          Contextes réels extraits de vos lectures — base future pour la révision espacée.
        </p>
      </div>

      {sentences.length === 0 ? (
        <VocabularyEmptyState
          title="Aucune phrase sauvegardée"
          lead="Sélectionnez une phrase dans le Reader et utilisez « Enregistrer la phrase »."
          ctaHref="/reader"
          ctaLabel="Ouvrir la lecture →"
          tone="sentences"
        />
      ) : (
        <ul className="vocabulary-grid vocabulary-grid--sentences">
          {sentences.map((sentence) => (
            <VocabularySentenceFiche key={sentence.id} sentence={sentence} />
          ))}
        </ul>
      )}
    </section>
  );
}
