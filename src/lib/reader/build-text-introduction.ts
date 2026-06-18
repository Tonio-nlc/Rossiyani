import type { ReaderTextData } from "@/features/texts";
import { getCollectionById } from "@/content/collections";

export type TextIntroduction = {
  summary: string;
  focusPoints: string[];
  readMinutes: number;
};

const CASE_FOCUS: Record<string, string> = {
  accusative: "accusative objects",
  genitive: "genitive forms",
  dative: "dative expressions",
  instrumental: "instrumental phrases",
  prepositional: "prepositional phrases",
  locative: "locative forms",
};

const LEVEL_FOCUS: Record<string, string> = {
  A1: "everyday vocabulary",
  A2: "everyday vocabulary",
  B1: "conversational patterns",
  B2: "nuanced expression",
  C1: "advanced structures",
  C2: "native-like usage",
};

export function buildTextIntroduction(
  text: ReaderTextData,
  readMinutes: number,
): TextIntroduction | null {
  const focusPoints: string[] = [];
  const seen = new Set<string>();

  const addFocus = (point: string) => {
    const key = point.trim().toLowerCase();
    if (!key || seen.has(key) || focusPoints.length >= 3) {
      return;
    }
    seen.add(key);
    focusPoints.push(point.trim());
  };

  const levelFocus = LEVEL_FOCUS[text.level];
  if (levelFocus) {
    addFocus(levelFocus);
  }

  const phraseLabels = new Set<string>();
  for (const sentence of text.sentences) {
    for (const group of sentence.phraseGroups) {
      phraseLabels.add(group.label);
    }
  }
  for (const label of [...phraseLabels].slice(0, 2)) {
    addFocus(label);
  }

  const cases = new Set<string>();
  for (const sentence of text.sentences) {
    for (const word of sentence.words) {
      if (word.case && word.case !== "nominative") {
        cases.add(word.case);
      }
    }
  }
  for (const caseKey of [...cases].slice(0, 2)) {
    const label = CASE_FOCUS[caseKey];
    if (label) {
      addFocus(label);
    }
  }

  const hasVerbs = text.sentences.some((sentence) =>
    sentence.words.some((word) => word.partOfSpeech === "verb"),
  );
  if (hasVerbs) {
    addFocus("verb forms in context");
  }

  const collection = getCollectionById(text.collectionId);
  const firstTranslation = text.sentences[0]?.naturalTranslation?.trim();
  let summary = collection.description;

  if (!summary && firstTranslation) {
    summary = firstTranslation.endsWith(".") ? firstTranslation : `${firstTranslation}.`;
  } else if (text.title) {
    summary = `A ${text.level} Russian text — ${text.title}.`;
  }

  if (!summary && focusPoints.length === 0) {
    return null;
  }

  return {
    summary: summary || `A ${text.level} reading text with ${text.sentences.length} sentences.`,
    focusPoints,
    readMinutes: Math.max(1, readMinutes),
  };
}
