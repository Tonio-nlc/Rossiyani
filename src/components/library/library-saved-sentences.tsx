"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { EditorialSectionHead } from "@/components/editorial/editorial-section-head";
import { Reference } from "@/components/editorial";
import { deleteSavedSentence, getSavedSentences } from "@/lib/phrase-mining";
import { practicePath } from "@/lib/practice/constants";
import type { SavedSentence } from "@/types/saved-sentence";

function formatSavedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SavedSentenceCard({
  sentence,
  onRemove,
}: {
  sentence: SavedSentence;
  onRemove: (id: string) => void;
}) {
  return (
    <article className="lib-saved-sentence-card">
      <p className="lib-saved-sentence-card__text break-russian">{sentence.text}</p>
      {sentence.translation ? (
        <p className="lib-saved-sentence-card__translation">{sentence.translation}</p>
      ) : null}

      <dl className="lib-saved-sentence-card__meta">
        <div>
          <dt>Source</dt>
          <dd>{sentence.sourceTextTitle}</dd>
        </div>
        {sentence.collection ? (
          <div>
            <dt>Collection</dt>
            <dd>{sentence.collection}</dd>
          </div>
        ) : null}
        <div>
          <dt>Enregistrée</dt>
          <dd>{formatSavedDate(sentence.createdAt)}</dd>
        </div>
      </dl>

      <footer className="lib-saved-sentence-card__footer">
        <Link href={`/texts/${sentence.sourceTextId}`} className="lib-saved-sentence-card__cta focus-kb">
          Ouvrir le texte →
        </Link>
        <Link
          href={practicePath({
            savedSentenceId: sentence.id,
            text: sentence.text,
            reference: sentence.text,
            context: `From: ${sentence.sourceTextTitle}`,
            textId: sentence.sourceTextId,
            textTitle: sentence.sourceTextTitle,
            from: "reader",
          })}
          className="lib-saved-sentence-card__cta focus-kb"
        >
          Pratiquer →
        </Link>
        <button
          type="button"
          onClick={() => onRemove(sentence.id)}
          className="lib-saved-sentence-card__remove focus-kb"
        >
          Retirer
        </button>
      </footer>
    </article>
  );
}

export function LibrarySavedSentences() {
  const [sentences, setSentences] = useState<SavedSentence[]>([]);

  const refresh = useCallback(() => {
    setSentences(getSavedSentences());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (sentences.length === 0) {
    return (
      <div className="lib-saved-sentences-empty">
        <EditorialSectionHead
          icon={
            <svg viewBox="0 0 20 20" fill="none" aria-hidden className="editorial-section-head__icon">
              <path d="M4 5.5h12M4 10h8M4 14.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          }
          title="Mes phrases"
          lead="Enregistrez des phrases en lecture pour les retrouver ici et les pratiquer plus tard."
        />
        <p className="lib-saved-sentences-empty__hint">
          Sélectionnez une phrase dans le Reader, puis utilisez « Enregistrer la phrase » dans le
          panneau latéral.
        </p>
        <Reference href="/reader">Ouvrir la lecture →</Reference>
      </div>
    );
  }

  return (
    <div className="lib-saved-sentences">
      <EditorialSectionHead
        icon={
          <svg viewBox="0 0 20 20" fill="none" aria-hidden className="editorial-section-head__icon">
            <path d="M4 5.5h12M4 10h8M4 14.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        }
        title="Mes phrases"
        lead={`${sentences.length} phrase${sentences.length > 1 ? "s" : ""} extraite${sentences.length > 1 ? "s" : ""} de vos lectures.`}
      />

      <ul className="lib-saved-sentence-grid">
        {sentences.map((sentence) => (
          <li key={sentence.id}>
            <SavedSentenceCard
              sentence={sentence}
              onRemove={(id) => {
                deleteSavedSentence(id);
                refresh();
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
