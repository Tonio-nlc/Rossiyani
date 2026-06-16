import {
  collocationPath,
  conceptPath,
  expressionPath,
  lemmaPath,
} from "@/components/explorer/explorer-routes";
import { practicePath } from "@/lib/practice/constants";
import { resolveWordSemanticData } from "@/lib/formatting/resolve-word-semantic-data";
import { isDisplayableUiText } from "@/lib/formatting/ui-placeholder-guard";
import type { ReaderTextData } from "@/features/texts";
import type { PhraseGroupType } from "@/types/domain";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import { buildLinguisticExplanation } from "./build-linguistic-explanation";
import {
  explorerHrefForPhrase,
  isConceptExplorerEligible,
  isPhraseExplorerEligible,
} from "@/features/explorer/entity/explorer-eligibility";

export type ReaderWordPanelRow = {
  label: string;
  value: string;
};

export type ReaderFoundInLink = {
  label: string;
  detail: string;
  href: string;
};

export type ReaderWordPanelData = {
  displayForm: string;
  lemma: string;
  partOfSpeech: string | null;
  translation: string | null;
  usedHere: ReaderWordPanelRow[];
  contextNotes: string[];
  collocations: string[];
  example: string | null;
  foundIn: ReaderFoundInLink[];
  explorerHref: string | null;
  practiceHref: string | null;
};

const POS_LABELS: Record<string, string> = {
  noun: "Noun",
  verb: "Verb",
  adjective: "Adjective",
  pronoun: "Pronoun",
  adverb: "Adverb",
  numeral: "Numeral",
  preposition: "Preposition",
  conjunction: "Conjunction",
  particle: "Particle",
  interjection: "Interjection",
};

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatGrammarValue(value: string | null): string | null {
  if (!value?.trim()) {
    return null;
  }
  const v = value.toLowerCase();
  const map: Record<string, string> = {
    masc: "Masculine",
    masculine: "Masculine",
    fem: "Feminine",
    feminine: "Feminine",
    neut: "Neuter",
    neuter: "Neuter",
    sing: "Singular",
    singular: "Singular",
    pl: "Plural",
    plural: "Plural",
    imperf: "Imperfective",
    imperfective: "Imperfective",
    perf: "Perfective",
    perfective: "Perfective",
  };
  for (const [key, label] of Object.entries(map)) {
    if (v.includes(key)) {
      return label;
    }
  }
  return titleCase(value.trim());
}

function buildUsedHereRows(detail: WordDetailGraph): ReaderWordPanelRow[] {
  const { occurrence } = detail;
  const rows: ReaderWordPanelRow[] = [];

  const caseValue = formatGrammarValue(occurrence.case);
  if (caseValue) {
    rows.push({ label: "Case", value: caseValue });
  }

  const numberValue = formatGrammarValue(occurrence.number);
  if (numberValue) {
    rows.push({ label: "Number", value: numberValue });
  }

  const genderValue = formatGrammarValue(occurrence.gender);
  if (genderValue) {
    rows.push({ label: "Gender", value: genderValue });
  }

  if (occurrence.partOfSpeech === "verb") {
    const aspect =
      formatGrammarValue(occurrence.aspect) ??
      formatGrammarValue(detail.lemmaKnowledge?.dominantAspect ?? null);
    if (aspect) {
      rows.push({ label: "Aspect", value: aspect });
    }
  }

  return rows;
}

function buildCollocations(
  detail: WordDetailGraph,
  textIndex: ReaderTextPhraseIndex | null,
): string[] {
  const seen = new Set<string>();
  const collocations: string[] = [];

  const add = (label: string, type = "COLLOCATION") => {
    const key = label.trim().toLowerCase();
    if (!isDisplayableUiText(label) || seen.has(key)) {
      return;
    }
    if (!isPhraseExplorerEligible(label, type)) {
      return;
    }
    seen.add(key);
    collocations.push(label.trim());
  };

  for (const phrase of detail.lemmaKnowledge?.phrases ?? []) {
    if (phrase.type === "COLLOCATION") {
      add(phrase.label, phrase.type);
    }
  }

  if (detail.phraseOccurrence?.type === "COLLOCATION") {
    add(detail.phraseOccurrence.label, detail.phraseOccurrence.type);
  }

  for (const label of textIndex?.collocationsByLemma.get(detail.occurrence.lemma) ?? []) {
    add(label, "COLLOCATION");
  }

  return collocations.slice(0, 6);
}

function buildFoundInLinks(detail: WordDetailGraph): ReaderFoundInLink[] {
  const { occurrence } = detail;
  const lemma = isDisplayableUiText(occurrence.lemma) ? occurrence.lemma : null;
  const pos = occurrence.partOfSpeech;
  const links: ReaderFoundInLink[] = [];

  const textCount = detail.statistics.seenInTexts || detail.lemmaKnowledge?.seenInTexts || 0;
  if (textCount > 0 && lemma) {
    links.push({
      label: "Texts",
      detail: `Appears in ${textCount} text${textCount === 1 ? "" : "s"}`,
      href: lemmaPath(lemma, pos),
    });
  }

  const expressions = (detail.lemmaKnowledge?.phrases ?? []).filter(
    (phrase) =>
      phrase.type !== "COLLOCATION" && isPhraseExplorerEligible(phrase.label, phrase.type),
  );
  if (expressions.length > 0) {
    const href = explorerHrefForPhrase(
      expressions[0]!.label,
      expressions[0]!.type,
      expressionPath(expressions[0]!.label),
    );
    if (href) {
      links.push({
        label: "Concepts",
        detail: `${expressions.length} related concept${expressions.length === 1 ? "" : "s"}`,
        href,
      });
    }
  } else if (
    detail.phraseOccurrence &&
    detail.phraseOccurrence.type !== "COLLOCATION" &&
    isPhraseExplorerEligible(detail.phraseOccurrence.label, detail.phraseOccurrence.type)
  ) {
    const href = explorerHrefForPhrase(
      detail.phraseOccurrence.label,
      detail.phraseOccurrence.type,
      expressionPath(detail.phraseOccurrence.label),
    );
    if (href) {
      links.push({
        label: "Concepts",
        detail: detail.phraseOccurrence.label,
        href,
      });
    }
  }

  const concept =
    detail.concepts[0] ??
    detail.lemmaKnowledge?.concepts[0] ??
    detail.lemmaKnowledge?.relatedConcepts[0];
  const lesson = detail.lemmaKnowledge?.relatedLessons[0];
  if (
    concept &&
    isConceptExplorerEligible(concept.conceptKey, concept.title, concept.category ?? "SEMANTIC")
  ) {
    links.push({
      label: "Grammar",
      detail: concept.title,
      href: conceptPath(concept.conceptKey),
    });
  } else if (lesson) {
    links.push({
      label: "Grammar",
      detail: lesson.title,
      href: `/manual/lecons/${lesson.slug}`,
    });
  }

  if (lemma) {
    links.push({
      label: "Practice",
      detail: "Generate your own sentence",
      href: practicePath({ structure: lemma, mode: "structure", from: "reader" }),
    });
  }

  return links;
}

export type ReaderTextPhraseIndex = {
  collocationsByLemma: Map<string, string[]>;
};

export function buildReaderTextPhraseIndex(text: ReaderTextData): ReaderTextPhraseIndex {
  const collocationsByLemma = new Map<string, string[]>();

  for (const sentence of text.sentences) {
    for (const group of sentence.phraseGroups) {
      if (group.type !== "COLLOCATION") {
        continue;
      }
      for (let position = group.startPosition; position <= group.endPosition; position += 1) {
        const word = sentence.words.find((item) => item.position === position);
        if (!word?.lemma) {
          continue;
        }
        const existing = collocationsByLemma.get(word.lemma) ?? [];
        if (!existing.includes(group.label)) {
          collocationsByLemma.set(word.lemma, [...existing, group.label]);
        }
      }
    }
  }

  return { collocationsByLemma };
}

export function buildReaderWordPanelData(
  detail: WordDetailGraph,
  textIndex: ReaderTextPhraseIndex | null,
  agreementTarget?: string | null,
): ReaderWordPanelData {
  const { occurrence } = detail;
  const semantic = resolveWordSemanticData(detail);
  const translation =
    semantic.primaryMeanings.join(" · ") ||
    detail.lemmaKnowledge?.primaryTranslation ||
    null;

  const example =
    detail.examples[0]?.trim() ||
    detail.lemmaKnowledge?.exampleSentences[0]?.trim() ||
    null;

  const explorerLemma = isDisplayableUiText(occurrence.lemma) ? occurrence.lemma : null;

  return {
    displayForm: occurrence.original,
    lemma: occurrence.lemma,
    partOfSpeech: POS_LABELS[occurrence.partOfSpeech] ?? null,
    translation,
    usedHere: buildUsedHereRows(detail),
    contextNotes: buildLinguisticExplanation(occurrence, {
      agreementTarget,
      frequencyTier: detail.lemmaKnowledge?.frequencyTier ?? null,
    }),
    collocations: buildCollocations(detail, textIndex),
    example,
    foundIn: buildFoundInLinks(detail),
    explorerHref: explorerLemma ? lemmaPath(explorerLemma, occurrence.partOfSpeech) : null,
    practiceHref: explorerLemma
      ? practicePath({ structure: explorerLemma, mode: "structure", from: "reader" })
      : null,
  };
}

export function collocationHref(label: string): string | null {
  return explorerHrefForPhrase(label, "COLLOCATION", collocationPath(label));
}

export type { PhraseGroupType };
