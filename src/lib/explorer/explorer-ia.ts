import type { CaseKey } from "@/features/grammar";
import { getCaseLegendEntry } from "@/features/grammar/case-legend-data";
import { casePath } from "@/components/explorer/explorer-routes";
import { formatCaseLabelFr } from "@/features/grammar";
import { firstSentence } from "@/features/explorer/entity/types";
import type { FrequencyTier } from "@/types/domain";
import type {
  LemmaExampleRef,
  LemmaKnowledge,
  LemmaTextRef,
} from "@/types/knowledge-graph";

export type ExplorerLemmaDefinition = {
  meaning: string;
  note?: string | null;
};

export type ExplorerLemmaExample = {
  russian: string;
  translation: string | null;
};

export type ExplorerTextOccurrence = {
  textId: string;
  textTitle: string;
  occurrenceCount: number;
};

export type ExplorerRelatedWord = {
  label: string;
  href: string;
};

export type ExplorerLinkItem = {
  label: string;
  href: string;
};

export type ExplorerMicroscopeFact = {
  label: string;
  value: string;
};

export type ExplorerMicroscopeData = {
  facts: ExplorerMicroscopeFact[];
  relatedConcepts?: ExplorerLinkItem[];
  relatedCases?: ExplorerLinkItem[];
  relatedWords?: ExplorerLinkItem[];
  similarItems?: ExplorerLinkItem[];
  linkedTexts: ExplorerTextOccurrence[];
};

export function estimatedLevelFromLemma(knowledge: LemmaKnowledge): string | null {
  switch (knowledge.frequencyTier) {
    case "TOP_500":
      return "A1";
    case "TOP_1000":
      return "A2";
    case "TOP_3000":
      return "B1";
    case "BEYOND_TOP_3000":
      return "B2";
    default:
      break;
  }

  if (knowledge.occurrenceCount >= 60) {
    return "A2";
  }
  if (knowledge.occurrenceCount >= 20) {
    return "B1";
  }
  if (knowledge.occurrenceCount > 0) {
    return "B2";
  }

  return null;
}

export function estimatedLevelFromTier(tier: FrequencyTier | null | undefined): string | null {
  switch (tier) {
    case "TOP_500":
      return "A1";
    case "TOP_1000":
      return "A2";
    case "TOP_3000":
      return "B1";
    case "BEYOND_TOP_3000":
      return "B2";
    default:
      return null;
  }
}

export function pickShortExamples(
  examples: LemmaExampleRef[],
  limit = 5,
): ExplorerLemmaExample[] {
  return [...examples]
    .filter((example) => example.sentenceRussian.trim().length > 0)
    .sort((left, right) => {
      const leftScore = left.sentenceRussian.length - (left.naturalTranslation ? 0 : 12);
      const rightScore = right.sentenceRussian.length - (right.naturalTranslation ? 0 : 12);
      return leftScore - rightScore;
    })
    .slice(0, limit)
    .map((example) => ({
      russian: example.sentenceRussian,
      translation: example.naturalTranslation,
    }));
}

export function pickShortSentences(sentences: string[], limit = 5): string[] {
  return [...new Set(sentences.map((sentence) => sentence.trim()).filter(Boolean))]
    .sort((left, right) => left.length - right.length)
    .slice(0, limit);
}

export function buildLemmaDefinitions(knowledge: LemmaKnowledge): ExplorerLemmaDefinition[] {
  const definitions: ExplorerLemmaDefinition[] = [];

  if (knowledge.primaryTranslation) {
    definitions.push({ meaning: knowledge.primaryTranslation });
  }

  for (const meaning of knowledge.secondaryTranslations) {
    if (definitions.length >= 3) {
      break;
    }
    if (!definitions.some((item) => item.meaning === meaning)) {
      definitions.push({ meaning });
    }
  }

  if (definitions.length > 0 && knowledge.simpleExplanation) {
    const note = firstSentence(knowledge.simpleExplanation);
    const last = definitions[definitions.length - 1];
    if (note && note !== last.meaning && !definitions.some((item) => item.meaning === note)) {
      definitions[definitions.length - 1] = { ...last, note };
    }
  } else if (definitions.length === 0 && knowledge.simpleExplanation) {
    definitions.push({ meaning: firstSentence(knowledge.simpleExplanation) });
  }

  if (definitions.length === 0 && knowledge.canonicalExplanation) {
    definitions.push({ meaning: firstSentence(knowledge.canonicalExplanation) });
  }

  return definitions.slice(0, 3);
}

export function mapTextOccurrences(texts: LemmaTextRef[]): ExplorerTextOccurrence[] {
  return texts.map((text) => ({
    textId: text.textId,
    textTitle: text.textTitle,
    occurrenceCount: text.occurrenceCount,
  }));
}

export function pickShortExamplesFromOccurrences<
  T extends { sentenceRussian: string; naturalTranslation: string | null },
>(occurrences: T[], limit = 5): ExplorerLemmaExample[] {
  return pickShortExamples(
    occurrences.map((occurrence, index) => ({
      id: `occurrence-${index}`,
      sentenceRussian: occurrence.sentenceRussian,
      naturalTranslation: occurrence.naturalTranslation,
      textId: null,
      textTitle: null,
    })),
    limit,
  );
}

export function observedInContexts(count: number): string {
  if (count <= 0) {
    return "Not yet observed in your texts";
  }
  if (count === 1) {
    return "Observed in 1 context";
  }
  return `Observed in ${count} contexts`;
}

export function appearsAcrossTexts(count: number): string {
  if (count <= 0) {
    return "Not yet seen in your texts";
  }
  if (count === 1) {
    return "Appears in 1 of your texts";
  }
  return `Appears across ${count} texts`;
}

export function seenInText(count: number): string {
  if (count <= 0) {
    return "Not seen in this text yet";
  }
  if (count === 1) {
    return "Seen once in this text";
  }
  return `Seen ${count} times in this text`;
}

export function patternObservedInTexts(count: number): string {
  if (count <= 0) {
    return "Pattern not yet observed";
  }
  if (count === 1) {
    return "Pattern seen in 1 context";
  }
  return `Pattern observed in ${count} contexts`;
}

export function seenInLevelMaterial(level: string): string {
  return `Seen frequently in ${level} material`;
}

/** @deprecated Use observedInContexts */
export function formatOccurrenceCount(count: number): string {
  return observedInContexts(count);
}

export function explorerFrequencyLabel(count: number): string {
  if (count >= 100) {
    return "Very common";
  }
  if (count >= 30) {
    return "Common";
  }
  if (count >= 10) {
    return "Moderate";
  }
  if (count > 0) {
    return "Rare in your texts";
  }
  return "Not yet observed";
}

export function explorerRegisterLabel(register?: string | null): string {
  switch (register) {
    case "formal":
      return "Formal";
    case "informal":
      return "Informal";
    case "neutral":
      return "Neutral";
    default:
      return "Neutral";
  }
}

export function groupOccurrencesByText(
  occurrences: Array<{
    textId: string | null;
    textTitle: string | null;
  }>,
): ExplorerTextOccurrence[] {
  const grouped = new Map<string, ExplorerTextOccurrence>();

  for (const occurrence of occurrences) {
    if (!occurrence.textId || !occurrence.textTitle) {
      continue;
    }

    const existing = grouped.get(occurrence.textId);
    if (existing) {
      existing.occurrenceCount += 1;
      continue;
    }

    grouped.set(occurrence.textId, {
      textId: occurrence.textId,
      textTitle: occurrence.textTitle,
      occurrenceCount: 1,
    });
  }

  return [...grouped.values()].sort((left, right) => right.occurrenceCount - left.occurrenceCount);
}

export function relatedCasesFromLemma(knowledge: LemmaKnowledge): ExplorerLinkItem[] {
  const caseKeys = new Set<string>();
  for (const form of knowledge.forms) {
    if (form.case) {
      caseKeys.add(form.case);
    }
  }

  return [...caseKeys].map((caseKey) => {
    const legend = getCaseLegendEntry(caseKey as CaseKey);
    return {
      label: legend?.frenchName ?? formatCaseLabelFr(caseKey) ?? caseKey,
      href: casePath(caseKey),
    };
  });
}
