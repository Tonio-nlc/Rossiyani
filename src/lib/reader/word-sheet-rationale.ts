import type { ReaderWordPanelData } from "@/lib/reader/build-reader-word-panel-data";
import type { WordDetailGraph } from "@/types/word-detail-graph";

const CASE_LABELS_FR: Record<string, string> = {
  nominative: "Forme nominative",
  accusative: "Forme accusative",
  genitive: "Forme génitive",
  dative: "Forme datif",
  instrumental: "Forme instrumentale",
  prepositional: "Forme prépositionnelle",
  locative: "Forme locative",
};

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

export function surfaceFormLabel(panel: ReaderWordPanelData): string | null {
  const caseRow = panel.usedHere.find((row) => row.label === "Case");
  if (caseRow) {
    const key = caseRow.value.toLowerCase();
    for (const [fragment, label] of Object.entries(CASE_LABELS_FR)) {
      if (key.includes(fragment)) {
        return label;
      }
    }
    return `Forme ${caseRow.value.toLowerCase()}`;
  }

  if (panel.displayForm !== panel.lemma) {
    return "Forme fléchie";
  }

  return null;
}

export function shouldShowLemmaFirst(panel: ReaderWordPanelData): boolean {
  return (
    isDisplayableLemma(panel.lemma) &&
    normalizeToken(panel.lemma) !== normalizeToken(panel.displayForm)
  );
}

function isDisplayableLemma(value: string): boolean {
  return value.trim().length > 0;
}

export function buildWordSheetRationales(input: {
  textTitle: string;
  detail: WordDetailGraph;
  panel: ReaderWordPanelData;
  timesSeenInText: number;
}): string[] {
  const lines: string[] = [`Rencontré dans : ${input.textTitle}`];

  if (input.timesSeenInText > 1) {
    lines.push(
      `Tu as déjà vu ce mot ${input.timesSeenInText} fois dans ce texte`,
    );
  } else if (input.detail.statistics.seenInTexts > 1) {
    lines.push(
      `Présent dans ${input.detail.statistics.seenInTexts} textes de ta bibliothèque`,
    );
  }

  if (input.panel.collocations.length > 0) {
    const partner = input.panel.collocations[0]!;
    lines.push(`Cette construction apparaît souvent avec ${partner}`);
  }

  return lines;
}
