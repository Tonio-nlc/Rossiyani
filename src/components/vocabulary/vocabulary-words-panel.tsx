import type { VocabularyWord } from "@/lib/vocabulary";

import { VocabularyEmptyState } from "./vocabulary-empty-state";
import { VocabularyWordFiche } from "./vocabulary-word-fiche";

type VocabularyWordsPanelProps = {
  words: VocabularyWord[];
  loading?: boolean;
};

export function VocabularyWordsPanel({ words, loading = false }: VocabularyWordsPanelProps) {
  return (
    <section className="vocabulary-panel" aria-labelledby="vocabulary-words-heading">
      <div className="vocabulary-panel__head">
        <h2 id="vocabulary-words-heading" className="vocabulary-panel__title">
          Mots appris
        </h2>
        <p className="vocabulary-panel__subtitle">
          Fiches linguistiques complètes — cliquez sur une carte pour ouvrir la fiche détaillée.
        </p>
      </div>

      {loading ? <p className="vocabulary-panel__loading">Enrichissement des fiches…</p> : null}

      {words.length === 0 ? (
        <VocabularyEmptyState
          title="Aucun mot pour l'instant"
          lead="Sélectionnez un mot dans le Reader et enregistrez-le pour le retrouver ici."
          ctaHref="/reader"
          ctaLabel="Ouvrir la lecture →"
          tone="words"
        />
      ) : (
        <ul className="vocabulary-grid vocabulary-grid--words">
          {words.map((word) => (
            <VocabularyWordFiche key={word.id} word={word} />
          ))}
        </ul>
      )}
    </section>
  );
}
