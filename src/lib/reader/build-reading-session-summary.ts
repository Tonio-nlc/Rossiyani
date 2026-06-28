import type { ReaderTextData } from "@/features/texts";

export type ReadingSessionContinueAction = {
  label: string;
  rationale: string;
  href: string;
};

export type ReadingSessionSummary = {
  continueActions: ReadingSessionContinueAction[];
};

/**
 * Rossiyani 2.0 — reading-first session close. No practice or explorer pushes.
 */
export function buildReadingSessionSummary(
  text: ReaderTextData,
  _seenWordIds: string[],
): ReadingSessionSummary {
  return {
    continueActions: [
      {
        label: "Lire un autre texte",
        rationale: "Continuer à découvrir le russe en lisant",
        href: "/library",
      },
      {
        label: "Retourner à la bibliothèque",
        rationale: `Revoir vos textes après « ${text.title} »`,
        href: "/library",
      },
    ],
  };
}
