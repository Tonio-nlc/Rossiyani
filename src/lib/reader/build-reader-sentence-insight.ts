import { clampToSentences } from "@/lib/formatting/clamp-text";
import { isDisplayableUiText } from "@/lib/formatting/ui-placeholder-guard";
import type { ReaderTextData } from "@/features/texts";

export type ReaderSentenceInsightSection = {
  id: string;
  title: string;
  body: string;
  fullBody: string;
  truncated: boolean;
};

export type ReaderSentenceInsight = {
  available: boolean;
  sections: ReaderSentenceInsightSection[];
};

type ReaderSentence = ReaderTextData["sentences"][number];

function isConstructionType(type: string): boolean {
  return (
    type === "NATIVE_CONSTRUCTION" ||
    type === "FIXED_EXPRESSION" ||
    type === "COLLOCATION"
  );
}

function pushSection(
  sections: ReaderSentenceInsightSection[],
  input: {
    id: string;
    title: string;
    text: string;
    maxSentences: number;
  },
): void {
  const trimmed = input.text.trim();
  if (!isDisplayableUiText(trimmed)) {
    return;
  }

  const clamped = clampToSentences(trimmed, input.maxSentences);
  if (!clamped.text) {
    return;
  }

  sections.push({
    id: input.id,
    title: input.title,
    body: clamped.text,
    fullBody: trimmed,
    truncated: clamped.truncated,
  });
}

export function buildReaderSentenceInsight(sentence: ReaderSentence): ReaderSentenceInsight {
  const sections: ReaderSentenceInsightSection[] = [];

  pushSection(sections, {
    id: "logic",
    title: "Logique de la phrase",
    text: sentence.russianLogic,
    maxSentences: 2,
  });

  pushSection(sections, {
    id: "order",
    title: "Ordre des mots",
    text: sentence.orderExplanation,
    maxSentences: 2,
  });

  for (const group of sentence.phraseGroups) {
    if (!isConstructionType(group.type)) {
      continue;
    }
    pushSection(sections, {
      id: `construction-${group.id}`,
      title: group.label.trim() || "Construction",
      text: group.explanation,
      maxSentences: 2,
    });
  }

  pushSection(sections, {
    id: "usage",
    title: "Remarque d'usage",
    text: sentence.nativeUsageNotes,
    maxSentences: 1,
  });

  return {
    available: sections.length > 0,
    sections,
  };
}
