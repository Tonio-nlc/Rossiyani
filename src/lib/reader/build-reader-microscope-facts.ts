import type { CaseKey } from "@/features/grammar";
import { formatCaseLabelFr, normalizeCaseKey } from "@/features/grammar";
import { getCaseLegendEntry } from "@/features/grammar/case-legend-data";
import { firstSentence } from "@/features/explorer/entity/types";
import { isCaseConcept } from "@/features/explorer/entity/explorer-eligibility";
import { explorerRegisterLabel } from "@/lib/explorer/explorer-ia";
import { buildFrequencyVisual } from "@/lib/explorer/lemma-display";
import {
  formatAspectFr,
  formatGenderFr,
  formatNumberFr,
} from "@/lib/formatting/word-morphology-display";
import { isDisplayableUiText } from "@/lib/formatting/ui-placeholder-guard";
import type { FrequencyTier, PartOfSpeech, PhraseGroupType } from "@/types/domain";
import type { LemmaKnowledge } from "@/types/knowledge-graph";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import type { ReaderTextPhraseIndex } from "./build-reader-word-panel-data";

export type ReaderMicroscopeFact = {
  label: string;
  value: string;
};

const CASE_PREPOSITIONS: Partial<Record<CaseKey, string>> = {
  genitive: "из · у · без · для · от",
  dative: "к · по",
  accusative: "в · на · через · за",
  instrumental: "с · за · под · перед",
  prepositional: "в · на · о · при",
  locative: "в · на",
};

const IRREGULAR_VERBS = new Set([
  "быть",
  "мочь",
  "хотеть",
  "дать",
  "есть",
  "идти",
  "ехать",
  "жить",
  "бежать",
  "лежать",
  "стоять",
  "сидеть",
]);

const PERSONAL_PRONOUNS: Record<string, string[]> = {
  я: ["я", "меня", "мне", "мной"],
  ты: ["ты", "тебя", "тебе", "тобой"],
  он: ["он", "его", "ему", "ним"],
  она: ["она", "её", "ей", "ней"],
  оно: ["оно", "его", "ему", "ним"],
  мы: ["мы", "нас", "нам", "нами"],
  вы: ["вы", "вас", "вам", "вами"],
  они: ["они", "их", "им", "ними"],
};

function addFact(
  facts: ReaderMicroscopeFact[],
  label: string,
  value: string | null | undefined,
): void {
  if (!value?.trim()) {
    return;
  }
  facts.push({ label, value: value.trim() });
}

function formatLevelLabel(
  knowledge: LemmaKnowledge | null,
  occurrenceFrequency: string | null,
  occurrenceTier: FrequencyTier | null | undefined,
): string | null {
  const visual = buildFrequencyVisual(
    occurrenceFrequency as import("@/types/domain").WordFrequency | null,
    occurrenceTier ?? knowledge?.frequencyTier ?? null,
    knowledge?.occurrenceCount ?? 0,
  );
  if (!visual) {
    return null;
  }

  const tier = knowledge?.frequencyTier ?? occurrenceTier;
  if (tier === "TOP_500") {
    return "Vocabulaire essentiel";
  }
  if (tier === "TOP_1000") {
    return "Courant";
  }
  if (tier === "TOP_3000") {
    return "Fréquent";
  }
  if (tier === "BEYOND_TOP_3000") {
    return "Avancé";
  }

  if (visual.filledStars >= 4) {
    return "Vocabulaire essentiel";
  }
  if (visual.filledStars >= 3) {
    return "Courant";
  }
  if (visual.filledStars >= 2) {
    return "Fréquent";
  }
  return "Avancé";
}

function inferConjugation(lemma: string): string | null {
  const inf = lemma.trim().toLowerCase();
  if (!inf) {
    return null;
  }
  if (IRREGULAR_VERBS.has(inf)) {
    return "Verbe irrégulier";
  }
  if (inf.endsWith("ить")) {
    return "2e conjugaison";
  }
  if (
    inf.endsWith("ать") ||
    inf.endsWith("ять") ||
    inf.endsWith("еть") ||
    inf.endsWith("оть") ||
    inf.endsWith("уть") ||
    inf.endsWith("ыть")
  ) {
    return "1re conjugaison";
  }
  return null;
}

function formatAspectPair(knowledge: LemmaKnowledge | null, lemma: string): string | null {
  const partner = knowledge?.aspectPartner?.lemma;
  if (!partner || partner === lemma) {
    return null;
  }
  return `${lemma} ↔ ${partner}`;
}

function pickCommonConstruction(
  detail: WordDetailGraph,
  textIndex: ReaderTextPhraseIndex | null,
): string | null {
  const { occurrence, lemmaKnowledge } = detail;
  const lemma = occurrence.lemma.trim();

  const phraseConstruction = lemmaKnowledge?.phrases.find(
    (phrase) => phrase.type === "COLLOCATION" || phrase.type === "NATIVE_CONSTRUCTION",
  );
  if (phraseConstruction?.label) {
    return phraseConstruction.label;
  }

  const textCollocation = textIndex?.collocationsByLemma.get(lemma)?.[0];
  if (textCollocation) {
    return textCollocation;
  }

  const constructionMatch = occurrence.explanation.match(
    /(?:construction|schéma|structure)\s*:\s*([^.;]+)/i,
  );
  if (constructionMatch?.[1]?.trim()) {
    return constructionMatch[1].trim();
  }

  const arrow = occurrence.explanation.match(/(?:→|->)\s*([^.;]+)/);
  return arrow?.[1]?.trim() ?? null;
}

function findPluralForm(knowledge: LemmaKnowledge | null): string | null {
  if (!knowledge) {
    return null;
  }

  const plural = knowledge.forms.find((form) => {
    const number = form.number?.toLowerCase() ?? "";
    const grammaticalCase = form.case?.toLowerCase() ?? "";
    return number.includes("plur") && (grammaticalCase === "nominative" || !form.case);
  });

  return plural?.original ?? null;
}

function inferAnimacy(explanation: string, partOfSpeech: PartOfSpeech): string | null {
  if (partOfSpeech !== "noun") {
    return null;
  }
  const lower = explanation.toLowerCase();
  if (/animé|animate/i.test(lower)) {
    return "Animé";
  }
  if (/inanimé|inanimate/i.test(lower)) {
    return "Inanimé";
  }
  return null;
}

function inferShortFormAvailability(
  knowledge: LemmaKnowledge | null,
  partOfSpeech: PartOfSpeech,
): string | null {
  if (partOfSpeech !== "adjective" || !knowledge) {
    return null;
  }

  const explanation = knowledge.canonicalExplanation?.toLowerCase() ?? "";
  if (/forme courte|кратк|short form/i.test(explanation)) {
    return "Oui";
  }

  const hasShortCandidate = knowledge.forms.some(
    (form) =>
      form.original.length <= knowledge.lemma.length &&
      form.original !== knowledge.lemma &&
      !form.ending,
  );

  return hasShortCandidate ? "Oui" : "Non";
}

function inferPronounType(lemma: string, explanation: string): string | null {
  const key = lemma.toLowerCase();
  if (PERSONAL_PRONOUNS[key] || Object.values(PERSONAL_PRONOUNS).some((forms) => forms.includes(key))) {
    return "Pronom personnel";
  }

  const possessive = ["мой", "твой", "свой", "наш", "ваш", "его", "её", "их"];
  if (possessive.some((stem) => key.startsWith(stem) || key === stem)) {
    return "Pronom possessif";
  }

  const demonstrative = ["этот", "тот", "такой", "это", "то"];
  if (demonstrative.some((stem) => key.startsWith(stem) || key === stem)) {
    return "Pronom démonstratif";
  }

  const relative = ["который", "кто", "что", "чей"];
  if (relative.some((stem) => key.startsWith(stem))) {
    return "Pronom relatif / interrogatif";
  }

  const typed = explanation.match(/(?:type|classe)\s*:\s*([^.;]+)/i);
  return typed?.[1]?.trim() ?? null;
}

function relatedPronounForms(knowledge: LemmaKnowledge | null, lemma: string): string | null {
  const key = lemma.toLowerCase();
  for (const forms of Object.values(PERSONAL_PRONOUNS)) {
    if (forms.includes(key)) {
      return forms.join(" · ");
    }
  }

  if (!knowledge?.forms.length) {
    return null;
  }

  const originals = [...new Set(knowledge.forms.map((form) => form.original))].slice(0, 6);
  return originals.length > 1 ? originals.join(" · ") : null;
}

function buildCaseFacts(detail: WordDetailGraph): ReaderMicroscopeFact[] {
  const caseKey = normalizeCaseKey(detail.occurrence.case);
  if (!caseKey) {
    return [];
  }

  const facts: ReaderMicroscopeFact[] = [];
  const legend = getCaseLegendEntry(caseKey);

  addFact(facts, "Cas", formatCaseLabelFr(caseKey) ?? legend?.frenchName ?? caseKey);
  addFact(facts, "Question", legend?.question ?? null);

  const concept =
    detail.concepts.find((item) => isCaseConcept(item.conceptKey, item.category)) ??
    detail.lemmaKnowledge?.concepts.find((item) =>
      isCaseConcept(item.conceptKey, item.category),
    );
  const functionNote =
    firstSentence(concept?.canonicalExplanation ?? "") ||
    firstSentence(legend?.frenchContrast ?? "");
  addFact(facts, "Fonction", functionNote);
  addFact(facts, "Prépositions fréquentes", CASE_PREPOSITIONS[caseKey] ?? null);

  return facts;
}

function buildVerbFacts(
  detail: WordDetailGraph,
  textIndex: ReaderTextPhraseIndex | null,
): ReaderMicroscopeFact[] {
  const { occurrence, lemmaKnowledge } = detail;
  const facts: ReaderMicroscopeFact[] = [];

  addFact(
    facts,
    "Aspect",
    formatAspectFr(occurrence.aspect) ?? lemmaKnowledge?.dominantAspect ?? null,
  );
  addFact(facts, "Paire", formatAspectPair(lemmaKnowledge, occurrence.lemma));
  addFact(facts, "Conjugaison", inferConjugation(occurrence.lemma));
  addFact(facts, "Construction", pickCommonConstruction(detail, textIndex));
  addFact(
    facts,
    "Niveau",
    formatLevelLabel(
      lemmaKnowledge,
      occurrence.frequency,
      detail.domain.lemma?.frequencyTier ?? null,
    ),
  );

  return facts;
}

function buildNounFacts(
  detail: WordDetailGraph,
  textIndex: ReaderTextPhraseIndex | null,
): ReaderMicroscopeFact[] {
  const { occurrence, lemmaKnowledge } = detail;
  const facts: ReaderMicroscopeFact[] = [];

  addFact(facts, "Genre", formatGenderFr(occurrence.gender));
  addFact(facts, "Animé", inferAnimacy(occurrence.explanation, occurrence.partOfSpeech));
  addFact(facts, "Cas", formatCaseLabelFr(occurrence.case));
  addFact(facts, "Lemme", isDisplayableUiText(occurrence.lemma) ? occurrence.lemma : null);
  addFact(facts, "Pluriel", findPluralForm(lemmaKnowledge));

  const construction =
    textIndex?.collocationsByLemma.get(occurrence.lemma)?.[0] ??
    lemmaKnowledge?.phrases.find((phrase) => phrase.type === "COLLOCATION")?.label ??
    null;
  addFact(facts, "Observé avec", construction);

  addFact(
    facts,
    "Niveau",
    formatLevelLabel(
      lemmaKnowledge,
      occurrence.frequency,
      detail.domain.lemma?.frequencyTier ?? null,
    ),
  );

  return facts;
}

function buildAdjectiveFacts(detail: WordDetailGraph): ReaderMicroscopeFact[] {
  const { occurrence, lemmaKnowledge } = detail;
  const facts: ReaderMicroscopeFact[] = [];

  addFact(
    facts,
    "Lemme",
    isDisplayableUiText(occurrence.lemma) ? occurrence.lemma : null,
  );
  addFact(facts, "Genre", formatGenderFr(occurrence.gender));
  addFact(facts, "Nombre", formatNumberFr(occurrence.number));
  addFact(facts, "Cas", formatCaseLabelFr(occurrence.case));
  addFact(
    facts,
    "Forme courte",
    inferShortFormAvailability(lemmaKnowledge, occurrence.partOfSpeech),
  );

  return facts;
}

function buildPronounFacts(detail: WordDetailGraph): ReaderMicroscopeFact[] {
  const { occurrence, lemmaKnowledge } = detail;
  const facts: ReaderMicroscopeFact[] = [];

  addFact(
    facts,
    "Type",
    inferPronounType(occurrence.lemma, occurrence.explanation) ?? "Pronom",
  );
  addFact(facts, "Cas", formatCaseLabelFr(occurrence.case));
  addFact(facts, "Formes", relatedPronounForms(lemmaKnowledge, occurrence.lemma));

  return facts;
}

function parseLiteralAndNaturalMeaning(detail: WordDetailGraph): {
  literal: string | null;
  natural: string | null;
} {
  const explanation = detail.phraseOccurrence?.explanation ?? detail.canonicalExplanation ?? "";
  const literalMatch = explanation.match(/(?:littéral|literal)\s*:\s*([^.;]+)/i);
  const naturalMatch = explanation.match(/(?:naturel|natural|sens)\s*:\s*([^.;]+)/i);

  if (detail.frenchComparison) {
    return {
      literal: detail.frenchComparison.russianStructure || literalMatch?.[1]?.trim() || null,
      natural: detail.frenchComparison.frenchStructure || naturalMatch?.[1]?.trim() || null,
    };
  }

  return {
    literal: literalMatch?.[1]?.trim() ?? null,
    natural: naturalMatch?.[1]?.trim() ?? firstSentence(explanation) ?? null,
  };
}

function phraseTypeLabel(type: PhraseGroupType): string {
  switch (type) {
    case "COLLOCATION":
      return "Collocation";
    case "FIXED_EXPRESSION":
      return "Expression figée";
    case "NATIVE_CONSTRUCTION":
      return "Construction";
    default:
      return "Expression";
  }
}

function buildExpressionFacts(detail: WordDetailGraph): ReaderMicroscopeFact[] {
  const phrase = detail.phraseOccurrence;
  if (!phrase) {
    return [];
  }

  const facts: ReaderMicroscopeFact[] = [];
  const meanings = parseLiteralAndNaturalMeaning(detail);
  const register = null;

  addFact(facts, "Type", phraseTypeLabel(phrase.type));
  addFact(facts, "Registre", explorerRegisterLabel(register));
  addFact(facts, "Sens littéral", meanings.literal);
  addFact(facts, "Sens", meanings.natural);

  return facts;
}

function buildCollocationFacts(
  detail: WordDetailGraph,
  textIndex: ReaderTextPhraseIndex | null,
): ReaderMicroscopeFact[] {
  const phrase = detail.phraseOccurrence;
  const label = phrase?.label ?? detail.domain.collocation?.label ?? null;
  if (!label) {
    return [];
  }

  const facts: ReaderMicroscopeFact[] = [];
  const meanings = parseLiteralAndNaturalMeaning(detail);
  const lemma = detail.occurrence.lemma;
  const alternatives = new Set<string>();

  for (const item of detail.lemmaKnowledge?.phrases ?? []) {
    if (item.type === "COLLOCATION" && item.label !== label) {
      alternatives.add(item.label);
    }
  }
  for (const item of textIndex?.collocationsByLemma.get(lemma) ?? []) {
    if (item !== label) {
      alternatives.add(item);
    }
  }

  const relatedWords = detail.lemmaKnowledge?.familyLemmas
    .slice(0, 4)
    .map((family) => family.lemma)
    .join(" · ");

  addFact(facts, "Collocation", label);
  addFact(facts, "Sens", meanings.natural ?? firstSentence(phrase?.explanation ?? ""));
  addFact(
    facts,
    "Alternatives",
    alternatives.size > 0 ? [...alternatives].slice(0, 4).join(" · ") : null,
  );
  addFact(facts, "Mots liés", relatedWords);

  return facts;
}

function dedupeFacts(facts: ReaderMicroscopeFact[]): ReaderMicroscopeFact[] {
  const seen = new Set<string>();
  return facts.filter((fact) => {
    const key = `${fact.label}:${fact.value}`.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function buildReaderMicroscopeFacts(
  detail: WordDetailGraph,
  textIndex: ReaderTextPhraseIndex | null,
): ReaderMicroscopeFact[] {
  const phraseType = detail.phraseOccurrence?.type;

  if (phraseType === "COLLOCATION") {
    return dedupeFacts(buildCollocationFacts(detail, textIndex));
  }

  if (phraseType === "FIXED_EXPRESSION" || phraseType === "NATIVE_CONSTRUCTION") {
    return dedupeFacts(buildExpressionFacts(detail));
  }

  const pos = detail.occurrence.partOfSpeech;
  let facts: ReaderMicroscopeFact[] = [];

  switch (pos) {
    case "verb":
      facts = buildVerbFacts(detail, textIndex);
      break;
    case "noun":
      facts = buildNounFacts(detail, textIndex);
      break;
    case "adjective":
      facts = buildAdjectiveFacts(detail);
      break;
    case "pronoun":
      facts = buildPronounFacts(detail);
      break;
    default:
      break;
  }

  const caseFacts = buildCaseFacts(detail);
  const caseLabels = new Set(caseFacts.map((fact) => fact.label));
  facts = facts.filter((fact) => !caseLabels.has(fact.label));
  facts.push(...caseFacts);

  return dedupeFacts(facts);
}
