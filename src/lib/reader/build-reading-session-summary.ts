import type { ReaderTextData } from "@/features/texts";
import { getNextFoundationTextId } from "@/lib/reader/foundation-pack-path";

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
  const nextTextId = getNextFoundationTextId(text.id);

  if (nextTextId) {
    return {
      continueActions: [
        {
          label: "Lire le texte suivant",
          rationale: "Continuer le parcours — la prochaine étape vous attend",
          href: `/texts/${nextTextId}`,
        },
        {
          label: "Relire ce texte",
          rationale: `Repasser sur « ${text.title} » avec ce que vous venez de remarquer`,
          href: `/texts/${text.id}`,
        },
      ],
    };
  }

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
