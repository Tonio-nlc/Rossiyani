"use client";

import { useEffect, useState } from "react";

import {
  completeFirstReadingCoach,
  shouldShowFirstReadingCoach,
} from "@/lib/onboarding";

const COACH_HINTS = [
  {
    title: "Touchez un mot",
    body: "Cliquez sur un mot surligné pour voir sa traduction et sa grammaire.",
  },
  {
    title: "Écoutez",
    body: "Le lecteur audio en bas de page vous aide à entendre la prononciation.",
  },
  {
    title: "Traductions",
    body: "Ouvrez la traduction d'une phrase quand vous en avez besoin.",
  },
  {
    title: "Enregistrez",
    body: "Dans l'explorateur, enregistrez un mot pour le retrouver dans Vocabulary.",
  },
  {
    title: "Plus tard",
    body: "Vos mots reviendront dans Review pour les ancrer en mémoire.",
  },
] as const;

type FirstReadingCoachProps = {
  textId: string;
};

export function FirstReadingCoach({ textId }: FirstReadingCoachProps) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setVisible(shouldShowFirstReadingCoach(textId));
  }, [textId]);

  if (!visible) {
    return null;
  }

  const hint = COACH_HINTS[index];
  const isLast = index >= COACH_HINTS.length - 1;

  const handleNext = () => {
    if (isLast) {
      completeFirstReadingCoach();
      setVisible(false);
      return;
    }
    setIndex((current) => current + 1);
  };

  const handleSkip = () => {
    completeFirstReadingCoach();
    setVisible(false);
  };

  return (
    <aside className="first-reading-coach" aria-live="polite">
      <div className="first-reading-coach__card">
        <p className="first-reading-coach__eyebrow">
          Conseil {index + 1}/{COACH_HINTS.length}
        </p>
        <h2 className="first-reading-coach__title">{hint.title}</h2>
        <p className="first-reading-coach__body">{hint.body}</p>
        <div className="first-reading-coach__actions">
          <button type="button" className="first-reading-coach__skip focus-kb" onClick={handleSkip}>
            Passer
          </button>
          <button type="button" className="first-reading-coach__next focus-kb" onClick={handleNext}>
            {isLast ? "C'est parti" : "Suivant"}
          </button>
        </div>
      </div>
    </aside>
  );
}
