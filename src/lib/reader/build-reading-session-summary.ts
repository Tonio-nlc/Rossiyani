import { lemmaPath } from "@/components/explorer/explorer-routes";
import type { ReaderTextData } from "@/features/texts";
import { practicePath } from "@/lib/practice/constants";
import { isDisplayableUiText } from "@/lib/formatting/ui-placeholder-guard";

export type ReadingSessionContinueAction = {
  label: string;
  rationale: string;
  href: string;
};

export type ReadingSessionSummary = {
  continueActions: ReadingSessionContinueAction[];
};

function isConstructionType(type: string): boolean {
  return (
    type === "NATIVE_CONSTRUCTION" ||
    type === "FIXED_EXPRESSION" ||
    type === "COLLOCATION"
  );
}

export function buildReadingSessionSummary(
  text: ReaderTextData,
  seenWordIds: string[],
): ReadingSessionSummary {
  const seenSet = new Set(seenWordIds);
  const lemmaDiscoveries = new Map<string, { lemma: string; partOfSpeech: string }>();
  const constructions = new Map<string, { explanation: string }>();

  for (const sentence of text.sentences) {
    for (const word of sentence.words) {
      if (!seenSet.has(word.id)) {
        continue;
      }

      const lemmaKey = word.lemma.trim().toLowerCase();
      if (lemmaKey && !lemmaDiscoveries.has(lemmaKey) && isDisplayableUiText(word.lemma)) {
        lemmaDiscoveries.set(lemmaKey, {
          lemma: word.lemma,
          partOfSpeech: word.partOfSpeech,
        });
      }
    }

    for (const group of sentence.phraseGroups) {
      if (!isConstructionType(group.type)) {
        continue;
      }

      const touched = sentence.words.some(
        (word) =>
          seenSet.has(word.id) &&
          word.position >= group.startPosition &&
          word.position <= group.endPosition,
      );

      if (touched && !constructions.has(group.label)) {
        constructions.set(group.label, { explanation: group.explanation });
      }
    }
  }

  const topConstruction = constructions.keys().next().value;
  const topLemma = lemmaDiscoveries.values().next().value;
  const fallbackLemma = text.sentences[0]?.words[0];

  const practiceAction: ReadingSessionContinueAction = topConstruction
    ? {
        label: `Pratiquer · ${topConstruction}`,
        rationale: `Rencontrée dans ${text.title}`,
        href: practicePath({
          structure: topConstruction,
          mode: "structure",
          from: "reader",
          context: `Utilisez ${topConstruction} dans une phrase inspirée de ce texte.`,
        }),
      }
    : topLemma
      ? {
          label: `Pratiquer · ${topLemma.lemma}`,
          rationale: `Mot clé de ${text.title}`,
          href: practicePath({
            lemma: topLemma.lemma,
            mode: "lemma",
            from: "reader",
            context: `Formez une phrase avec ${topLemma.lemma}.`,
          }),
        }
      : {
          label: "Pratiquer les points clés",
          rationale: `Structures et vocabulaire de ${text.title}`,
          href: "/practice",
        };

  const explorerAction: ReadingSessionContinueAction = topLemma
    ? {
        label: `Explorer · ${topLemma.lemma}`,
        rationale: `Mot rencontré dans ${text.title}`,
        href: lemmaPath(topLemma.lemma, topLemma.partOfSpeech),
      }
    : fallbackLemma
      ? {
          label: `Explorer · ${fallbackLemma.lemma}`,
          rationale: `Mot clé de ${text.title}`,
          href: lemmaPath(fallbackLemma.lemma, fallbackLemma.partOfSpeech),
        }
      : {
          label: "Ouvrir l'Explorer",
          rationale: "Parcourir le lexique et les observations",
          href: "/explorer",
        };

  const continueActions: ReadingSessionContinueAction[] = [
    {
      label: "Continuer la lecture",
      rationale: "Choisir un autre texte dans votre bibliothèque",
      href: "/library",
    },
    practiceAction,
    explorerAction,
    {
      label: "Retourner à la bibliothèque",
      rationale: "Revoir vos textes et votre progression",
      href: "/library",
    },
  ];

  return { continueActions };
}
