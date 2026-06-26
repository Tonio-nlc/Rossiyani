"use client";

import { useCallback, useEffect, useState } from "react";

import { Card, EmptyState, GhostButton, PrimaryButton, TextButton } from "@/components/design-system";
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
          <h1 className="r3-hero-title practice-my-sentences__title">Mes phrases</h1>
          <p className="r3-lead practice-my-sentences__lead">
            Pratiquez uniquement les phrases que vous avez enregistrées en lecture.
          </p>
        </header>
        <EmptyState
          className="practice-my-sentences__empty-card"
          eyebrow="Practice"
          title="Aucune phrase enregistrée"
          description="Lisez un texte et enregistrez des phrases pour les retravailler ici."
          action={{ label: "Lire et enregistrer →", href: "/reader" }}
        />
      </div>
    );
  }

  return (
    <div className="practice-my-sentences">
      <header className="practice-my-sentences__intro">
        <h1 className="r3-hero-title practice-my-sentences__title">Mes phrases</h1>
        <p className="r3-lead practice-my-sentences__lead">
          Retravaillez les phrases extraites de vos lectures — vocabulaire, structure et contexte
          réels.
        </p>
      </header>

      <ul className="practice-my-sentences__list">
        {sentences.map((sentence) => (
          <li key={sentence.id} className="ws-card-grid__cell">
            <Card as="article" className="lessons-lesson-card ws-card practice-my-sentences__card">
              <div className="ws-card__body">
                <p className="practice-my-sentences__text ws-card__title break-russian">{sentence.text}</p>
                {sentence.translation ? (
                  <p className="practice-my-sentences__translation ws-card__desc">{sentence.translation}</p>
                ) : null}
                <p className="practice-my-sentences__source">
                  {sentence.sourceTextTitle}
                  {sentence.collection ? ` · ${sentence.collection}` : ""} ·{" "}
                  {formatSavedDate(sentence.createdAt)}
                </p>
              </div>
              <footer className="ws-card__footer practice-my-sentences__actions">
                <PrimaryButton
                  href={practicePath({
                    savedSentenceId: sentence.id,
                    text: sentence.text,
                    reference: sentence.text,
                    context: `From: ${sentence.sourceTextTitle}`,
                    textId: sentence.sourceTextId,
                    textTitle: sentence.sourceTextTitle,
                    from: "reader",
                  })}
                  className="practice-my-sentences__cta"
                >
                  Pratiquer cette phrase →
                </PrimaryButton>
                <TextButton href={`/texts/${sentence.sourceTextId}`} className="practice-my-sentences__link">
                  Relire le texte
                </TextButton>
                <GhostButton
                  onClick={() => {
                    deleteSavedSentence(sentence.id);
                    refresh();
                  }}
                  className="practice-my-sentences__remove"
                >
                  Retirer
                </GhostButton>
              </footer>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
