import { lemmaPath } from "@/components/explorer/explorer-routes";
import type { ReaderTextData } from "@/features/texts";
import { practicePath } from "@/lib/practice/constants";
import { isDisplayableUiText } from "@/lib/formatting/ui-placeholder-guard";

export type ReadingSessionDiscovery = {
  label: string;
  detail?: string;
};

export type ReadingSessionContinueAction = {
  label: string;
  rationale: string;
  href: string;
};

export type ReadingSessionSummary = {
  discoveries: ReadingSessionDiscovery[];
  continueActions: ReadingSessionContinueAction[];
};

function glossFromExplanation(explanation: string): string | undefined {
  const trimmed = explanation.trim();
  if (!isDisplayableUiText(trimmed) || trimmed.length < 2) {
    return undefined;
  }

  const first = trimmed.split(/(?<=[.!?])\s+/)[0]?.trim() ?? trimmed;
  return first.length > 80 ? `${first.slice(0, 77)}…` : first;
}

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
  const lemmaDiscoveries = new Map<string, ReadingSessionDiscovery>();
  const constructions = new Map<string, { explanation: string }>();
  let grammarLemma: { lemma: string; partOfSpeech: string; caseLabel: string } | null =
    null;

  for (const sentence of text.sentences) {
    for (const word of sentence.words) {
      if (!seenSet.has(word.id)) {
        continue;
      }

      const lemmaKey = word.lemma.trim().toLowerCase();
      if (lemmaKey && !lemmaDiscoveries.has(lemmaKey) && isDisplayableUiText(word.lemma)) {
        lemmaDiscoveries.set(lemmaKey, {
          label: word.lemma,
          detail: glossFromExplanation(word.explanation),
        });
      }

      if (
        !grammarLemma &&
        word.case &&
        word.case !== "nominative" &&
        isDisplayableUiText(word.lemma)
      ) {
        grammarLemma = {
          lemma: word.lemma,
          partOfSpeech: word.partOfSpeech,
          caseLabel: word.case,
        };
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

  const discoveries: ReadingSessionDiscovery[] = [
    ...Array.from(constructions.keys()).map((label) => ({
      label,
      detail: "Construction repérée dans ce texte",
    })),
    ...Array.from(lemmaDiscoveries.values()),
  ].slice(0, 6);

  const continueActions: ReadingSessionContinueAction[] = [];
  const topConstruction = constructions.keys().next().value;

  if (topConstruction) {
    continueActions.push({
      label: `Pratiquer · ${topConstruction}`,
      rationale: `Rencontrée dans ${text.title}`,
      href: practicePath({
        structure: topConstruction,
        mode: "structure",
        from: "reader",
        context: `Utilisez ${topConstruction} dans une phrase inspirée de ce texte.`,
      }),
    });
  }

  if (grammarLemma) {
    continueActions.push({
      label: `Comprendre · ${grammarLemma.lemma}`,
      rationale: `Forme ${grammarLemma.caseLabel} observée dans ${text.title}`,
      href: lemmaPath(grammarLemma.lemma, grammarLemma.partOfSpeech),
    });
  }

  const topLemma = lemmaDiscoveries.values().next().value;
  if (topLemma) {
    continueActions.push({
      label: `Explorer · ${topLemma.label}`,
      rationale: `Mot rencontré dans ${text.title}`,
      href: `/explorer?q=${encodeURIComponent(topLemma.label)}`,
    });
  } else if (text.sentences[0]?.words[0]?.lemma) {
    const fallback = text.sentences[0].words[0];
    continueActions.push({
      label: `Explorer · ${fallback.lemma}`,
      rationale: `Mot clé de ${text.title}`,
      href: lemmaPath(fallback.lemma, fallback.partOfSpeech),
    });
  }

  return { discoveries, continueActions: continueActions.slice(0, 3) };
}
