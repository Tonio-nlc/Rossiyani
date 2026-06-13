import { formatCaseLabelFr, POS_LABELS_FR } from "@/features/grammar";
import { clampToSentences } from "@/lib/formatting/clamp-text";
import {
  pickReliableExplanationText,
} from "@/lib/formatting/word-explanation-guard";
import {
  formatGenderFr,
  formatNumberFr,
  shouldShowStress,
} from "@/lib/formatting/word-morphology-display";
import type { PartOfSpeech } from "@/types/domain";
import type { GraphConceptSummary } from "@/types/knowledge-graph";
import type { WordDetailGraph } from "@/types/word-detail-graph";

export type GrammarCardField = {
  label: string;
  value: string;
};

export type GrammarCardContext = {
  nextWord?: {
    original: string;
    partOfSpeech: string;
    case: string | null;
  } | null;
  previousWord?: { original: string; partOfSpeech: string } | null;
  sentenceRussian?: string | null;
  sentenceLiteralFrench?: string | null;
  sentenceNaturalFrench?: string | null;
  selectedWordOriginal?: string | null;
};

function hasText(value: string | null | undefined): value is string {
  return Boolean(value?.trim());
}

function addField(
  fields: GrammarCardField[],
  label: string,
  value: string | null | undefined,
): void {
  if (hasText(value)) {
    fields.push({ label, value: value.trim() });
  }
}

function pickFirst(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (hasText(value)) {
      return value.trim();
    }
  }
  return null;
}

function extractQuotedExample(text: string): string | null {
  const guillemets = text.match(/«([^»]+)»/);
  if (guillemets?.[1]?.trim()) {
    return guillemets[1].trim();
  }
  const exampleLine = text.match(/(?:ex(?:emple)?|p\.?\s*ex)\.?\s*:?\s*(.+)$/im);
  if (exampleLine?.[1]?.trim()) {
    return exampleLine[1].trim().replace(/\.$/, "");
  }
  return null;
}

function parseConstructionFromExplanation(
  explanation: string,
  preposition: string,
): string | null {
  const prepPattern = new RegExp(
    `${preposition}\\s*\\+\\s*(accusatif|génitif|génitive|datif|instrumental|prépositionnel|préposition|locatif|nominatif|accusative|genitive|dative|prepositional|instrumental|locative|nominative)`,
    "i",
  );
  const direct = explanation.match(prepPattern);
  if (direct) {
    const caseFr = formatCaseLabelFr(direct[1]) ?? direct[1].toLowerCase();
    return `${preposition} + ${caseFr}`;
  }

  const requiresCase = explanation.match(
    /(?:requiert|exige|prend|gouverne)\s+(?:le\s+)?(accusatif|génitif|datif|instrumental|prépositionnel|locatif|nominatif)/i,
  );
  if (requiresCase) {
    const caseFr = formatCaseLabelFr(requiresCase[1]) ?? requiresCase[1].toLowerCase();
    return `${preposition} + ${caseFr}`;
  }

  return null;
}

function pickRealExample(detail: WordDetailGraph, needle: string): string | null {
  for (const example of detail.examples) {
    if (example.includes(needle)) {
      return example;
    }
  }
  if (detail.phraseOccurrence?.label.includes(needle)) {
    return detail.phraseOccurrence.label;
  }
  if (detail.examples[0]) {
    return detail.examples[0];
  }
  return extractQuotedExample(detail.occurrence.explanation);
}

function findPrepositionConcept(detail: WordDetailGraph): GraphConceptSummary | null {
  return (
    detail.concepts.find((concept) => concept.category === "PREPOSITION_PATTERN") ??
    detail.concepts.find((concept) =>
      concept.title.toLowerCase().includes(detail.occurrence.original.toLowerCase()),
    ) ??
    null
  );
}

function resolvePrepositionConstruction(
  detail: WordDetailGraph,
  context?: GrammarCardContext,
): string | null {
  const prep = detail.occurrence.original;
  if (context?.nextWord?.case) {
    const caseFr = formatCaseLabelFr(context.nextWord.case);
    if (caseFr) {
      return `${prep} + ${caseFr}`;
    }
  }

  const concept = findPrepositionConcept(detail);
  if (concept?.title) {
    return concept.title;
  }

  return (
    parseConstructionFromExplanation(detail.occurrence.explanation, prep) ??
    concept?.canonicalExplanation ??
    null
  );
}

function capitalizeLabel(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function parseConjunctionRole(explanation: string): string | null {
  const roleMatch = explanation.match(
    /(?:rôle|fonction)\s*:\s*([^.;]+)/i,
  );
  if (roleMatch?.[1]?.trim()) {
    return capitalizeLabel(roleMatch[1].trim());
  }
  if (/coordination|coordinat/i.test(explanation)) {
    return "Coordination";
  }
  if (/subordination|subordon/i.test(explanation)) {
    return "Subordination";
  }
  return null;
}

function parseParticleRole(explanation: string): string | null {
  const roleMatch = explanation.match(/(?:rôle|fonction)\s*:\s*([^.;]+)/i);
  if (roleMatch?.[1]?.trim()) {
    return roleMatch[1].trim();
  }
  if (/modale|modalité|emphase|négation|aspect/i.test(explanation)) {
    const modal = explanation.match(/(modale|modalité|emphase|négation|aspect[^.;]*)/i);
    return modal?.[1] ?? null;
  }
  return null;
}

function parseTypicalConstruction(explanation: string): string | null {
  const construction = explanation.match(
    /(?:construction|schéma|structure)\s*:\s*([^.;]+)/i,
  );
  if (construction?.[1]?.trim()) {
    return construction[1].trim();
  }
  const arrow = explanation.match(/(?:→|->)\s*([^.;]+)/);
  return arrow?.[1]?.trim() ?? null;
}

function parseComparisonForms(explanation: string): string | null {
  const comparative = explanation.match(
    /(?:comparatif|superlatif|degré[^:]*)\s*:\s*([^.;]+)/i,
  );
  if (comparative?.[1]?.trim()) {
    return comparative[1].trim();
  }
  if (/comparatif|superlatif/i.test(explanation)) {
    const { text } = clampToSentences(explanation, 1);
    return text;
  }
  return null;
}

function inferPronounType(lemma: string, explanation: string): string | null {
  const key = lemma.toLowerCase();
  const possessive = ["мой", "твой", "свой", "наш", "ваш", "его", "её", "их"];
  const demonstrative = ["этот", "тот", "такой", "столько", "это", "то"];
  const personal = ["я", "ты", "он", "она", "оно", "мы", "вы", "они"];
  const relative = ["который", "кто", "что", "чей"];
  const reflexive = ["себя", "себе", "собой"];

  if (possessive.some((stem) => key.startsWith(stem) || key === stem)) {
    return "Possessif";
  }
  if (demonstrative.some((stem) => key.startsWith(stem) || key === stem)) {
    return "Démonstratif";
  }
  if (personal.includes(key)) {
    return "Personnel";
  }
  if (relative.some((stem) => key.startsWith(stem))) {
    return "Relatif / interrogatif";
  }
  if (reflexive.some((stem) => key.includes(stem))) {
    return "Réfléchi";
  }

  const typed = explanation.match(/(?:type|classe)\s*:\s*([^.;]+)/i);
  return typed?.[1]?.trim() ?? null;
}

function buildPronounExamples(detail: WordDetailGraph): string | null {
  const fromGraph = detail.examples.slice(0, 2);
  if (fromGraph.length > 0) {
    return fromGraph.join(" · ");
  }
  const quoted = extractQuotedExample(detail.occurrence.explanation);
  if (quoted) {
    return quoted;
  }
  if (detail.phraseOccurrence?.label) {
    return detail.phraseOccurrence.label;
  }
  return null;
}

function resolvePrepositionExample(detail: WordDetailGraph): string | null {
  const prep = detail.occurrence.original;

  for (const example of detail.examples) {
    if (example.includes(prep)) {
      return example;
    }
  }

  const explanation = detail.occurrence.explanation;
  const arrowExample = explanation.match(
    new RegExp(`(${prep}[^→\\n]{1,30})\\s*(?:→|->)\\s*([^.;\\n]{2,50})`, "i"),
  );
  if (arrowExample?.[1] && arrowExample[2]) {
    return `${arrowExample[1].trim()} → ${arrowExample[2].trim()}`;
  }

  const quoted = extractQuotedExample(explanation);
  if (quoted?.includes(prep)) {
    return quoted;
  }

  if (detail.examples[0]) {
    return detail.examples[0];
  }

  return null;
}

function resolveAlternatePrepositionConstruction(
  detail: WordDetailGraph,
  context: GrammarCardContext | undefined,
  primaryConstruction: string | null,
): string | null {
  const prep = detail.occurrence.original;
  const candidates = new Set<string>();

  for (const concept of detail.concepts) {
    if (concept.category === "PREPOSITION_PATTERN" && concept.title.trim()) {
      candidates.add(concept.title.trim());
    }
  }

  const fromExplanation = detail.occurrence.explanation.match(
    new RegExp(`${prep}\\s*\\+\\s*[^.;]+`, "gi"),
  );
  fromExplanation?.forEach((item) => candidates.add(item.trim()));

  const normalizedPrimary = primaryConstruction?.toLowerCase();
  for (const candidate of candidates) {
    if (candidate.toLowerCase() !== normalizedPrimary) {
      const altMeaning = detail.concepts.find((c) => c.title === candidate)?.canonicalExplanation;
      if (altMeaning?.trim()) {
        const { text } = clampToSentences(altMeaning, 1);
        return `${candidate} — ${text}`;
      }
      return candidate;
    }
  }

  if (context?.nextWord?.case) {
    const secondaryCases = ["accusative", "instrumental", "genitive", "dative", "prepositional"];
    for (const caseKey of secondaryCases) {
      if (caseKey === context.nextWord.case) {
        continue;
      }
      const caseLabel = formatCaseLabelFr(caseKey);
      if (caseLabel) {
        const alt = `${prep} + ${caseLabel}`;
        if (alt.toLowerCase() !== normalizedPrimary) {
          return alt;
        }
      }
    }
  }

  return null;
}

function buildPrepositionFields(
  detail: WordDetailGraph,
  context?: GrammarCardContext,
): GrammarCardField[] {
  const fields: GrammarCardField[] = [];
  const construction = resolvePrepositionConstruction(detail, context);
  addField(fields, "Construction", construction);
  addField(fields, "Exemple", resolvePrepositionExample(detail));
  addField(
    fields,
    "Autre construction",
    resolveAlternatePrepositionConstruction(detail, context, construction),
  );
  return fields;
}

function pickReliableFunctionNote(detail: WordDetailGraph): string | null {
  const reliable = pickReliableExplanationText(detail);
  if (!reliable) {
    return null;
  }
  const { text } = clampToSentences(reliable, 1);
  return text.trim() || null;
}

function buildConjunctionFields(detail: WordDetailGraph): GrammarCardField[] {
  const explanation = detail.occurrence.explanation;
  const fields: GrammarCardField[] = [];

  addField(
    fields,
    "Rôle",
    pickFirst(parseConjunctionRole(explanation)),
  );
  addField(fields, "Fonction", pickReliableFunctionNote(detail));
  addField(
    fields,
    "Exemple",
    pickFirst(
      pickRealExample(detail, detail.occurrence.original),
      detail.phraseOccurrence?.label,
    ),
  );
  return fields;
}

function buildParticleFields(detail: WordDetailGraph): GrammarCardField[] {
  const explanation = detail.occurrence.explanation;
  const fields: GrammarCardField[] = [];

  addField(fields, "Rôle", parseParticleRole(explanation));
  addField(fields, "Usage", pickReliableFunctionNote(detail));
  addField(
    fields,
    "Construction",
    pickFirst(parseTypicalConstruction(explanation), detail.phraseOccurrence?.label),
  );
  addField(fields, "Exemple", pickRealExample(detail, detail.occurrence.original));
  return fields;
}

function buildPronounFields(detail: WordDetailGraph): GrammarCardField[] {
  const fields: GrammarCardField[] = [];
  addField(
    fields,
    "Type",
    inferPronounType(detail.occurrence.lemma, detail.occurrence.explanation),
  );
  addField(fields, "Genre", formatGenderFr(detail.occurrence.gender));
  addField(fields, "Nombre", formatNumberFr(detail.occurrence.number));
  addField(fields, "Cas", formatCaseLabelFr(detail.occurrence.case));
  addField(fields, "Exemple", buildPronounExamples(detail));
  return fields;
}

function buildAdverbFields(detail: WordDetailGraph): GrammarCardField[] {
  const explanation = detail.occurrence.explanation;
  const fields: GrammarCardField[] = [];

  addField(fields, "Degrés", parseComparisonForms(explanation));
  addField(fields, "Usage", pickReliableFunctionNote(detail));
  addField(fields, "Exemple", pickRealExample(detail, detail.occurrence.original));
  return fields;
}

function buildGenericFunctionFields(detail: WordDetailGraph): GrammarCardField[] {
  const pos = detail.occurrence.partOfSpeech;
  const fields: GrammarCardField[] = [];
  addField(fields, "Catégorie", POS_LABELS_FR[pos] ?? pos);
  addField(fields, "Exemple", pickRealExample(detail, detail.occurrence.original));
  return fields;
}

export function isInflectedAnalysisPos(partOfSpeech: PartOfSpeech): boolean {
  return (
    partOfSpeech === "noun" ||
    partOfSpeech === "adjective" ||
    partOfSpeech === "verb"
  );
}

export function buildFunctionWordGrammarFields(
  detail: WordDetailGraph,
  context?: GrammarCardContext,
): GrammarCardField[] {
  const pos = detail.occurrence.partOfSpeech;

  switch (pos) {
    case "preposition":
      return buildPrepositionFields(detail, context);
    case "conjunction":
      return buildConjunctionFields(detail);
    case "particle":
      return buildParticleFields(detail);
    case "pronoun":
      return buildPronounFields(detail);
    case "adverb":
      return buildAdverbFields(detail);
    default:
      return buildGenericFunctionFields(detail);
  }
}

export function shouldShowAccentForCard(detail: WordDetailGraph): boolean {
  return shouldShowStress(detail.occurrence);
}
