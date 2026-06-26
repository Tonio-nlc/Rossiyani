import Link from "next/link";

import { practicePath } from "@/lib/practice/constants";
import type { VocabularySentence } from "@/lib/vocabulary";

import { VocabularyEmptyState } from "./vocabulary-empty-state";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function VocabularySentenceCard({ sentence }: { sentence: VocabularySentence }) {
  return (
    <article className="vocabulary-card">
      <p className="vocabulary-card__russian break-russian">{sentence.russian}</p>
      {sentence.translation ? (
        <p className="vocabulary-card__translation">{sentence.translation}</p>
      ) : null}
      <div className="vocabulary-card__meta">
        {sentence.collection ? <span className="vocabulary-tag">{sentence.collection}</span> : null}
        <span className="vocabulary-tag">Phrase</span>
      </div>
      <footer className="vocabulary-card__footer">
        <Link href={`/texts/${sentence.sourceTextId}`} className="vocabulary-link focus-kb">
          {sentence.sourceTextTitle} →
        </Link>
        <Link
          href={practicePath({
            savedSentenceId: sentence.id,
            text: sentence.russian,
            reference: sentence.russian,
            context: `From: ${sentence.sourceTextTitle}`,
            textId: sentence.sourceTextId,
            textTitle: sentence.sourceTextTitle,
            from: "reader",
          })}
          className="vocabulary-link vocabulary-link--subtle focus-kb"
        >
          Pratiquer
        </Link>
        <p className="vocabulary-card__date">Enregistrée le {formatDate(sentence.savedAt)}</p>
      </footer>
    </article>
  );
}

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
          lead="Sélectionnez une phrase dans le Reader et utilisez « Enregistrer la phrase » dans le panneau latéral."
          ctaHref="/reader"
          ctaLabel="Ouvrir la lecture →"
        />
      ) : (
        <ul className="vocabulary-grid vocabulary-grid--sentences">
          {sentences.map((sentence) => (
            <li key={sentence.id}>
              <VocabularySentenceCard sentence={sentence} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
