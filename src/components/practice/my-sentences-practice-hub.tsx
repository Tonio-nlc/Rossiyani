"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

export function MySentencesPracticeHub() {
  const [sentences, setSentences] = useState<SavedSentence[]>([]);

  const refresh = useCallback(() => {
    setSentences(getSavedSentences());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (sentences.length === 0) {
    return (
      <div className="practice-my-sentences practice-my-sentences--empty">
        <header className="practice-my-sentences__intro">
          <h1 className="practice-my-sentences__title">Mes phrases</h1>
          <p className="practice-my-sentences__lead">
            Pratiquez uniquement les phrases que vous avez enregistrées en lecture.
          </p>
        </header>
        <p className="practice-my-sentences__empty">
          Aucune phrase enregistrée pour le moment.{" "}
          <Link href="/reader" className="practice-my-sentences__link focus-kb">
            Lire et enregistrer →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="practice-my-sentences">
      <header className="practice-my-sentences__intro">
        <h1 className="practice-my-sentences__title">Mes phrases</h1>
        <p className="practice-my-sentences__lead">
          Retravaillez les phrases extraites de vos lectures — vocabulaire, structure et contexte
          réels.
        </p>
      </header>

      <ul className="practice-my-sentences__list">
        {sentences.map((sentence) => (
          <li key={sentence.id}>
            <article className="practice-my-sentences__card">
              <p className="practice-my-sentences__text break-russian">{sentence.text}</p>
              {sentence.translation ? (
                <p className="practice-my-sentences__translation">{sentence.translation}</p>
              ) : null}
              <p className="practice-my-sentences__source">
                {sentence.sourceTextTitle}
                {sentence.collection ? ` · ${sentence.collection}` : ""} ·{" "}
                {formatSavedDate(sentence.createdAt)}
              </p>
              <div className="practice-my-sentences__actions">
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
                  className="practice-my-sentences__cta focus-kb"
                >
                  Pratiquer cette phrase →
                </Link>
                <Link
                  href={`/texts/${sentence.sourceTextId}`}
                  className="practice-my-sentences__link focus-kb"
                >
                  Relire le texte
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    deleteSavedSentence(sentence.id);
                    refresh();
                  }}
                  className="practice-my-sentences__remove focus-kb"
                >
                  Retirer
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
