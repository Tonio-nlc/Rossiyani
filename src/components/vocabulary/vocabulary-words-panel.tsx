import Link from "next/link";

import type { VocabularyWord } from "@/lib/vocabulary";

import { VocabularyEmptyState } from "./vocabulary-empty-state";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function VocabularyWordCard({ word }: { word: VocabularyWord }) {
  return (
    <article className="vocabulary-card">
      <p className="vocabulary-card__russian break-russian">{word.russian}</p>
      {word.lemma && word.lemma.toLowerCase() !== word.russian.toLowerCase() ? (
        <p className="vocabulary-card__translation">Lemme : {word.lemma}</p>
      ) : null}
      <div className="vocabulary-card__meta">
        {word.lemma ? <span className="vocabulary-tag vocabulary-tag--lemma">{word.lemma}</span> : null}
        <span className="vocabulary-tag">Mot</span>
      </div>
      <footer className="vocabulary-card__footer">
        <Link href={`/texts/${word.textId}`} className="vocabulary-link focus-kb">
          Voir dans le texte →
        </Link>
        <p className="vocabulary-card__date">Ajouté le {formatDate(word.savedAt)}</p>
      </footer>
    </article>
  );
}

type VocabularyWordsPanelProps = {
  words: VocabularyWord[];
};

export function VocabularyWordsPanel({ words }: VocabularyWordsPanelProps) {
  return (
    <section className="vocabulary-panel" aria-labelledby="vocabulary-words-heading">
      <div className="vocabulary-panel__head">
        <h2 id="vocabulary-words-heading" className="vocabulary-panel__title">
          Mots appris
        </h2>
        <p className="vocabulary-panel__subtitle">
          Chaque mot sauvegardé en lecture devient une fiche — traduction, grammaire et contextes
          s&apos;enrichiront progressivement.
        </p>
      </div>

      {words.length === 0 ? (
        <VocabularyEmptyState
          title="Aucun mot pour l'instant"
          lead="Sélectionnez un mot dans le Reader et enregistrez-le pour le retrouver ici."
          ctaHref="/reader"
          ctaLabel="Ouvrir la lecture →"
        />
      ) : (
        <ul className="vocabulary-grid vocabulary-grid--words">
          {words.map((word) => (
            <li key={word.id}>
              <VocabularyWordCard word={word} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
