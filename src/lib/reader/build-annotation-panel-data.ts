import { collocationPath, expressionPath, lemmaPath } from "@/components/explorer/explorer-routes";
import { practicePath } from "@/lib/practice/constants";
import { LEXICAL_TRANSLATION_EMPTY } from "@/lib/formatting/lexical-validation";
import { resolveWordSemanticData } from "@/lib/formatting/resolve-word-semantic-data";
import {
  isDisplayableUiText,
  isTranslationOnlyLine,
} from "@/lib/formatting/ui-placeholder-guard";
import {
  buildMorphologyDisplayFields,
  formatAspectFr,
} from "@/lib/formatting/word-morphology-display";
import { WORD_EXPLANATION_EMPTY } from "@/lib/formatting/word-explanation-guard";
import type { PartOfSpeech } from "@/types/domain";
import type { WordDetailGraph } from "@/types/word-detail-graph";

export type AnnotationGrammarRow = {
  label: string;
  value: string;
};

export type AnnotationRelation = {
  label: string;
  href: string;
};

export type AnnotationLesson = {
  title: string;
  href: string;
};

export type AnnotationPanelData = {
  displayForm: string;
  lemma: string | null;
  partOfSpeech: string | null;
  headerProperties: string[];
  usage: string | null;
  grammar: AnnotationGrammarRow[];
  translation: {
    primary: string[];
    secondary: string[];
  } | null;
  exampleSentence: string | null;
  relations: AnnotationRelation[];
  lessons: AnnotationLesson[];
  explorerHref: string | null;
  practiceHref: string | null;
};

const POS_LABELS_EN: Record<PartOfSpeech, string> = {
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

const GRAMMAR_LABEL_EN: Record<string, string> = {
  Lemme: "Lemma",
  Personne: "Person",
  Temps: "Tense",
  Aspect: "Aspect",
  Mode: "Mood",
  Genre: "Gender",
  Nombre: "Number",
  Cas: "Case",
};

const GRAMMAR_VALUE_EN: Record<string, string> = {
  Masculin: "Masculine",
  Féminin: "Feminine",
  Neutre: "Neuter",
  Pluriel: "Plural",
  Singulier: "Singular",
  Présent: "Present",
  Passé: "Past",
  Futur: "Future",
  Impératif: "Imperative",
  Infinitif: "Infinitive",
  Participe: "Participle",
  Imperfectif: "Imperfective",
  Perfectif: "Perfective",
  indicatif: "Indicative",
  subjonctif: "Subjunctive",
  conditionnel: "Conditional",
  impératif: "Imperative",
  infinitif: "Infinitive",
  participe: "Participle",
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const key = normalizeKey(value);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(value);
  }

  return result;
}

function toEnglishGrammarValue(value: string): string {
  const trimmed = value.trim();
  return GRAMMAR_VALUE_EN[trimmed] ?? GRAMMAR_VALUE_EN[trimmed.toLowerCase()] ?? trimmed;
}

function resolveAspectLabel(detail: WordDetailGraph): string | null {
  const fromLemma = detail.lemmaKnowledge?.dominantAspect;
  if (fromLemma) {
    return toEnglishGrammarValue(fromLemma);
  }
  const fromForm = formatAspectFr(detail.occurrence.aspect);
  return fromForm ? toEnglishGrammarValue(fromForm) : null;
}

function buildHeaderProperties(detail: WordDetailGraph): string[] {
  const { occurrence } = detail;
  const properties: string[] = [];

  const pos = POS_LABELS_EN[occurrence.partOfSpeech];
  if (pos) {
    properties.push(pos);
  }

  if (occurrence.partOfSpeech === "verb") {
    const aspect = resolveAspectLabel(detail);
    if (aspect) {
      properties.push(aspect);
    }
  }

  return dedupeStrings(properties);
}

function buildGrammarRows(
  detail: WordDetailGraph,
  headerProperties: string[],
): AnnotationGrammarRow[] {
  const headerKeys = new Set(headerProperties.map(normalizeKey));
  const rows: AnnotationGrammarRow[] = [];

  for (const field of buildMorphologyDisplayFields(detail.occurrence)) {
    if (field.label === "Lemme") {
      continue;
    }

    const label = GRAMMAR_LABEL_EN[field.label] ?? field.label;
    const value = toEnglishGrammarValue(field.value);

    if (headerKeys.has(normalizeKey(value)) || headerKeys.has(normalizeKey(field.value))) {
      continue;
    }

    rows.push({ label, value });
  }

  const pos = POS_LABELS_EN[detail.occurrence.partOfSpeech];
  if (pos && !headerKeys.has(normalizeKey(pos))) {
    rows.unshift({ label: "Part of speech", value: pos });
  }

  const aspect = resolveAspectLabel(detail);
  if (
    aspect &&
    detail.occurrence.partOfSpeech === "verb" &&
    !headerKeys.has(normalizeKey(aspect)) &&
    !rows.some((row) => row.label === "Aspect")
  ) {
    rows.push({ label: "Aspect", value: aspect });
  }

  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.label}:${normalizeKey(row.value)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildUsage(detail: WordDetailGraph, explanation: string): string | null {
  if (isDisplayableUiText(explanation) && explanation !== WORD_EXPLANATION_EMPTY) {
    return explanation;
  }

  const simple = detail.lemmaKnowledge?.simpleExplanation?.trim();
  if (simple && isDisplayableUiText(simple) && !isTranslationOnlyLine(simple)) {
    return simple;
  }

  return null;
}

function buildTranslation(
  detail: WordDetailGraph,
  primaryMeanings: string[],
  extraMeanings: string[],
): AnnotationPanelData["translation"] {
  let primary = primaryMeanings.filter(
    (meaning) => meaning.trim() && meaning !== LEXICAL_TRANSLATION_EMPTY,
  );
  let secondary = extraMeanings.filter(
    (meaning) => meaning.trim() && meaning !== LEXICAL_TRANSLATION_EMPTY,
  );

  if (primary.length === 0 && detail.lemmaKnowledge?.primaryTranslation) {
    primary = [detail.lemmaKnowledge.primaryTranslation];
    secondary = detail.lemmaKnowledge.secondaryTranslations.filter(Boolean);
  }

  if (primary.length === 0) {
    return null;
  }

  return { primary, secondary };
}

function buildRelations(detail: WordDetailGraph): AnnotationRelation[] {
  const { occurrence } = detail;
  const knowledge = detail.lemmaKnowledge;
  const seen = new Set<string>();
  const relations: AnnotationRelation[] = [];

  const addLemma = (label: string, partOfSpeech: PartOfSpeech) => {
    const key = normalizeKey(label);
    if (!isDisplayableUiText(label) || seen.has(key) || key === normalizeKey(occurrence.lemma)) {
      return;
    }
    seen.add(key);
    relations.push({ label, href: lemmaPath(label, partOfSpeech) });
  };

  if (knowledge?.aspectPartner) {
    addLemma(knowledge.aspectPartner.lemma, knowledge.aspectPartner.partOfSpeech);
  }

  for (const member of knowledge?.familyLemmas ?? []) {
    addLemma(member.lemma, member.partOfSpeech);
  }

  for (const phrase of knowledge?.phrases ?? []) {
    const key = normalizeKey(phrase.label);
    if (!isDisplayableUiText(phrase.label) || seen.has(key)) {
      continue;
    }
    seen.add(key);
    relations.push({
      label: phrase.label,
      href:
        phrase.type === "COLLOCATION"
          ? collocationPath(phrase.label)
          : expressionPath(phrase.label),
    });
  }

  return relations.slice(0, 8);
}

function buildLessons(detail: WordDetailGraph): AnnotationLesson[] {
  return (detail.lemmaKnowledge?.relatedLessons ?? []).slice(0, 4).map((lesson) => ({
    title: lesson.title,
    href: `/manual/lecons/${lesson.slug}`,
  }));
}

export function buildAnnotationPanelData(detail: WordDetailGraph): AnnotationPanelData {
  const { occurrence } = detail;
  const semantic = resolveWordSemanticData(detail);
  const headerProperties = buildHeaderProperties(detail);

  const lemma =
    isDisplayableUiText(occurrence.lemma) && occurrence.lemma !== occurrence.original
      ? occurrence.lemma
      : isDisplayableUiText(occurrence.lemma)
        ? occurrence.lemma
        : null;

  const explorerLemma = isDisplayableUiText(occurrence.lemma) ? occurrence.lemma : null;
  const pos = POS_LABELS_EN[occurrence.partOfSpeech] ?? null;
  const exampleSentence = detail.examples[0]?.trim() || null;

  return {
    displayForm: occurrence.original,
    lemma,
    partOfSpeech: pos,
    headerProperties,
    usage: buildUsage(detail, semantic.explanation),
    grammar: buildGrammarRows(detail, headerProperties),
    translation: buildTranslation(detail, semantic.primaryMeanings, semantic.extraMeanings),
    exampleSentence,
    relations: buildRelations(detail),
    lessons: buildLessons(detail),
    explorerHref: explorerLemma
      ? lemmaPath(explorerLemma, occurrence.partOfSpeech)
      : null,
    practiceHref: explorerLemma
      ? practicePath({
          structure: explorerLemma,
          mode: "structure",
          from: "reader",
        })
      : null,
  };
}
