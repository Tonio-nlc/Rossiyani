import type { CaseKey } from "@/features/grammar";
import { formatCaseLabelFr, normalizeCaseKey, POS_LABELS_FR } from "@/features/grammar";
import { getCaseLegendEntry } from "@/features/grammar/case-legend-data";
import { firstSentence } from "@/features/explorer/entity/types";
import { isCaseConcept } from "@/features/explorer/entity/explorer-eligibility";
import { explorerRegisterLabel } from "@/lib/explorer/explorer-ia";
import { buildFrequencyVisual } from "@/lib/explorer/lemma-display";
import { resolveWordSemanticData } from "@/lib/formatting/resolve-word-semantic-data";
import { isDisplayableUiText } from "@/lib/formatting/ui-placeholder-guard";
import {
  formatAspectFr,
  formatGenderFr,
  formatNumberFr,
} from "@/lib/formatting/word-morphology-display";
import type { FrequencyTier, PartOfSpeech, PhraseGroupType, WordFrequency } from "@/types/domain";
import type { LemmaKnowledge } from "@/types/knowledge-graph";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import type { ReaderTextPhraseIndex } from "./build-reader-word-panel-data";

export type MicroscopeRow = {
  label: string;
  value: string;
};

export type MicroscopeSection = {
  id: string;
  title: string;
  rows: MicroscopeRow[];
  note?: string;
};

export type ReaderMicroscopeView = {
  headline: string;
  lemma: string | null;
  translation: string | null;
  metadataLine: string | null;
  frequencyLabel: string | null;
  sections: MicroscopeSection[];
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

const MOTION_VERB_LEMMAS = new Set([
  "идти",
  "ходить",
  "ехать",
  "ездить",
  "бежать",
  "бегать",
  "лететь",
  "летать",
  "плыть",
  "плавать",
  "нести",
  "носить",
  "вести",
  "водить",
  "ползти",
  "ползать",
  "бросать",
  "бросить",
  "катить",
  "кататься",
]);

function capitalizeLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function posLabelFr(partOfSpeech: PartOfSpeech): string {
  return capitalizeLabel(POS_LABELS_FR[partOfSpeech] ?? partOfSpeech);
}

function addRow(
  rows: MicroscopeRow[],
  label: string,
  value: string | null | undefined,
): void {
  if (!value?.trim()) {
    return;
  }
  rows.push({ label, value: value.trim() });
}

function formatFrequencyLabel(
  knowledge: LemmaKnowledge | null,
  occurrenceFrequency: string | null,
  occurrenceTier: FrequencyTier | null | undefined,
): string | null {
  const visual = buildFrequencyVisual(
    occurrenceFrequency as WordFrequency | null,
    occurrenceTier ?? knowledge?.frequencyTier ?? null,
    knowledge?.occurrenceCount ?? 0,
  );
  if (!visual) {
    return null;
  }

  const tier = knowledge?.frequencyTier ?? occurrenceTier;
  if (tier === "TOP_500") {
    return "Fréquence : vocabulaire essentiel";
  }
  if (tier === "TOP_1000") {
    return "Fréquence : courant";
  }
  if (tier === "TOP_3000") {
    return "Fréquence : fréquent";
  }
  if (tier === "BEYOND_TOP_3000") {
    return "Fréquence : avancé";
  }

  if (visual.filledStars >= 4) {
    return "Fréquence : vocabulaire essentiel";
  }
  if (visual.filledStars >= 3) {
    return "Fréquence : courant";
  }
  if (visual.filledStars >= 2) {
    return "Fréquence : fréquent";
  }
  return "Fréquence : avancé";
}

function estimateCefr(detail: WordDetailGraph): string | null {
  const lessonLevel = detail.lemmaKnowledge?.relatedLessons[0]?.level?.trim();
  if (lessonLevel) {
    const match = lessonLevel.toUpperCase().match(/^(A1|A2|B1|B2|C1)/);
    if (match) {
      return match[0];
    }
  }

  const tier =
    detail.lemmaKnowledge?.frequencyTier ?? detail.domain.lemma?.frequencyTier ?? null;
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

function buildMetadataLine(partOfSpeech: PartOfSpeech, cefr: string | null): string | null {
  const pos = posLabelFr(partOfSpeech);
  return cefr ? `${pos} · ${cefr}` : pos;
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

function isReflexiveVerb(lemma: string, original: string): boolean {
  const key = lemma.toLowerCase();
  if (key.endsWith("ся") || key.endsWith("сь")) {
    return true;
  }
  return /\b\w+(ся|сь)\b/.test(original.toLowerCase());
}

function isMotionVerb(detail: WordDetailGraph, lemma: string): boolean {
  if (MOTION_VERB_LEMMAS.has(lemma.toLowerCase())) {
    return true;
  }
  const concepts = [
    ...detail.concepts,
    ...(detail.lemmaKnowledge?.concepts ?? []),
    ...(detail.lemmaKnowledge?.relatedConcepts ?? []),
  ];
  return concepts.some((concept) => concept.conceptKey.toLowerCase().includes("motion"));
}

function formatCurrentCase(caseValue: string | null, numberValue: string | null): string | null {
  const caseLabel = formatCaseLabelFr(caseValue);
  const numberLabel = formatNumberFr(numberValue);
  if (caseLabel && numberLabel) {
    return `${caseLabel} ${numberLabel.toLowerCase()}`;
  }
  return caseLabel ?? numberLabel;
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

function parseLiteralAndNaturalMeaning(detail: WordDetailGraph): {
  literal: string | null;
  natural: string | null;
} {
  const explanation =
    detail.phraseOccurrence?.explanation ??
    detail.phraseKnowledge?.canonicalExplanation ??
    detail.canonicalExplanation ??
    "";
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
    natural:
      naturalMatch?.[1]?.trim() ??
      firstSentence(detail.phraseKnowledge?.canonicalExplanation ?? explanation) ??
      null,
  };
}

function inferRegister(detail: WordDetailGraph): string | null {
  const explanation = (
    detail.phraseOccurrence?.explanation ??
    detail.phraseKnowledge?.canonicalExplanation ??
    ""
  ).toLowerCase();
  if (/famili|colloqu|argot|slang/i.test(explanation)) {
    return explorerRegisterLabel("casual");
  }
  if (/formel|literary|littéraire|bookish/i.test(explanation)) {
    return explorerRegisterLabel("formal");
  }
  if (/neutre|neutral|standard/i.test(explanation)) {
    return explorerRegisterLabel("neutral");
  }
  return explorerRegisterLabel("neutral");
}

function buildCaseSection(detail: WordDetailGraph): MicroscopeSection | null {
  const caseKey = normalizeCaseKey(detail.occurrence.case);
  if (!caseKey) {
    return null;
  }

  const rows: MicroscopeRow[] = [];
  const legend = getCaseLegendEntry(caseKey);
  const caseName = formatCaseLabelFr(caseKey) ?? legend?.frenchName ?? caseKey;

  addRow(rows, "Cas", caseName);
  addRow(rows, "Question", legend?.question ?? null);

  const concept =
    detail.concepts.find((item) => isCaseConcept(item.conceptKey, item.category)) ??
    detail.lemmaKnowledge?.concepts.find((item) =>
      isCaseConcept(item.conceptKey, item.category),
    );
  const functionNote =
    firstSentence(concept?.canonicalExplanation ?? "") ||
    firstSentence(legend?.frenchContrast ?? "");
  addRow(rows, "Fonction", functionNote);
  addRow(rows, "Prépositions fréquentes", CASE_PREPOSITIONS[caseKey] ?? null);

  return rows.length > 0
    ? {
        id: "case",
        title: caseName,
        rows,
      }
    : null;
}

function buildVerbSection(
  detail: WordDetailGraph,
  textIndex: ReaderTextPhraseIndex | null,
): MicroscopeSection | null {
  const { occurrence, lemmaKnowledge } = detail;
  const rows: MicroscopeRow[] = [];

  const aspect =
    formatAspectFr(occurrence.aspect) ??
    formatAspectFr(lemmaKnowledge?.dominantAspect ?? null);
  addRow(rows, "Aspect", aspect);
  addRow(rows, "Paire d'aspect", formatAspectPair(lemmaKnowledge, occurrence.lemma));
  addRow(rows, "Conjugaison", inferConjugation(occurrence.lemma));

  if (isReflexiveVerb(occurrence.lemma, occurrence.original)) {
    addRow(rows, "Réfléchi", "Oui");
  }
  if (isMotionVerb(detail, occurrence.lemma)) {
    addRow(rows, "Mouvement", "Verbe de mouvement");
  }

  const construction =
    textIndex?.collocationsByLemma.get(occurrence.lemma)?.[0] ??
    lemmaKnowledge?.phrases.find(
      (phrase) => phrase.type === "COLLOCATION" || phrase.type === "NATIVE_CONSTRUCTION",
    )?.label ??
    null;
  addRow(rows, "Construction fréquente", construction);

  return rows.length > 0
    ? {
        id: "verb",
        title: "Verbe",
        rows,
      }
    : null;
}

function buildNounSection(detail: WordDetailGraph): MicroscopeSection | null {
  const { occurrence } = detail;
  const rows: MicroscopeRow[] = [];

  addRow(
    rows,
    "Lemme",
    isDisplayableUiText(occurrence.lemma) ? occurrence.lemma : null,
  );
  addRow(rows, "Genre", formatGenderFr(occurrence.gender));
  addRow(rows, "Animé", inferAnimacy(occurrence.explanation, occurrence.partOfSpeech));
  addRow(
    rows,
    "Forme actuelle",
    formatCurrentCase(occurrence.case, occurrence.number),
  );

  return rows.length > 0
    ? {
        id: "noun",
        title: "Nom",
        rows,
      }
    : null;
}

function buildAdjectiveSection(detail: WordDetailGraph): MicroscopeSection | null {
  const { occurrence } = detail;
  const rows: MicroscopeRow[] = [];

  addRow(
    rows,
    "Lemme",
    isDisplayableUiText(occurrence.lemma) ? occurrence.lemma : null,
  );
  addRow(rows, "Genre", formatGenderFr(occurrence.gender));
  addRow(rows, "Nombre", formatNumberFr(occurrence.number));
  addRow(
    rows,
    "Accord",
    formatCurrentCase(occurrence.case, occurrence.number),
  );

  return rows.length > 0
    ? {
        id: "adjective",
        title: "Adjectif",
        rows,
      }
    : null;
}

function buildExpressionSection(detail: WordDetailGraph): MicroscopeSection | null {
  const phrase = detail.phraseOccurrence;
  if (!phrase || phrase.type === "COLLOCATION") {
    return null;
  }

  const rows: MicroscopeRow[] = [];
  const meanings = parseLiteralAndNaturalMeaning(detail);

  addRow(rows, "Expression", phrase.label);
  addRow(rows, "Sens", meanings.natural);
  addRow(rows, "Sens littéral", meanings.literal);
  addRow(rows, "Registre", inferRegister(detail));

  return {
    id: "expression",
    title: "Expression",
    rows,
  };
}

function buildCollocationSection(
  detail: WordDetailGraph,
  textIndex: ReaderTextPhraseIndex | null,
): MicroscopeSection | null {
  const phrase = detail.phraseOccurrence;
  const label = phrase?.type === "COLLOCATION" ? phrase.label : detail.domain.collocation?.label;
  if (!label) {
    const fromLemma = textIndex?.collocationsByLemma.get(detail.occurrence.lemma)?.[0];
    if (!fromLemma) {
      return null;
    }
    return {
      id: "collocation",
      title: "Collocation",
      rows: [
        { label: "Groupe", value: fromLemma },
        {
          label: "Usage",
          value:
            firstSentence(detail.lemmaKnowledge?.canonicalExplanation ?? "") ??
            "Ces mots apparaissent ensemble dans des contextes fixes.",
        },
      ],
      note:
        detail.lemmaKnowledge?.phrases.find((item) => item.type === "COLLOCATION")?.label ===
        fromLemma
          ? "Schéma récurrent dans votre bibliothèque."
          : "Association observée dans ce texte.",
    };
  }

  const rows: MicroscopeRow[] = [];
  const meanings = parseLiteralAndNaturalMeaning(detail);
  const explanation =
    firstSentence(phrase?.explanation ?? "") ??
    firstSentence(detail.phraseKnowledge?.canonicalExplanation ?? "") ??
    firstSentence(detail.canonicalExplanation);

  addRow(rows, "Groupe", label);
  addRow(rows, "Sens", meanings.natural);
  addRow(
    rows,
    "Pourquoi ensemble",
    explanation ?? "Ces mots se combinent selon un schéma idiomatique fixe.",
  );

  const pattern =
    detail.lemmaKnowledge?.phrases
      .filter((item) => item.type === "COLLOCATION" && item.label !== label)
      .slice(0, 3)
      .map((item) => item.label)
      .join(" · ") || null;
  addRow(rows, "Variantes", pattern);

  return {
    id: "collocation",
    title: "Collocation",
    rows,
    note: explanation ?? undefined,
  };
}

function buildEndingSection(detail: WordDetailGraph): MicroscopeSection | null {
  const ending =
    detail.occurrence.ending?.trim() ||
    detail.endingKnowledge?.ending?.trim() ||
    null;
  if (!ending) {
    return null;
  }

  const rows: MicroscopeRow[] = [];
  const caseKey =
    normalizeCaseKey(detail.occurrence.case) ??
    normalizeCaseKey(detail.endingKnowledge?.caseKey ?? null);
  const caseLabel = caseKey ? formatCaseLabelFr(caseKey) : null;
  const gender = formatGenderFr(detail.occurrence.gender);
  const number = formatNumberFr(detail.occurrence.number);

  const morphologyParts = [caseLabel, gender, number].filter(Boolean);
  const morphology =
    morphologyParts.length > 0
      ? morphologyParts.join(" · ")
      : null;

  addRow(rows, "Terminaison", ending.startsWith("-") ? ending : `-${ending}`);
  addRow(rows, "Fonction", morphology);
  addRow(rows, "Cas lié", caseLabel);
  addRow(
    rows,
    "Note",
    firstSentence(detail.endingKnowledge?.canonicalExplanation ?? ""),
  );

  return {
    id: "ending",
    title: "Terminaison",
    rows,
    note: detail.endingKnowledge?.canonicalExplanation
      ? firstSentence(detail.endingKnowledge.canonicalExplanation) ?? undefined
      : undefined,
  };
}

function buildGenericSection(detail: WordDetailGraph): MicroscopeSection | null {
  const { occurrence } = detail;
  const rows: MicroscopeRow[] = [];

  addRow(
    rows,
    "Lemme",
    isDisplayableUiText(occurrence.lemma) ? occurrence.lemma : null,
  );
  addRow(rows, "Catégorie", posLabelFr(occurrence.partOfSpeech));
  addRow(rows, "Forme", formatCurrentCase(occurrence.case, occurrence.number));

  return rows.length > 0
    ? {
        id: "word",
        title: "Mot",
        rows,
      }
    : null;
}

function pickHeadline(detail: WordDetailGraph): { headline: string; lemma: string | null } {
  const phrase = detail.phraseOccurrence;
  if (phrase && (phrase.type === "FIXED_EXPRESSION" || phrase.type === "NATIVE_CONSTRUCTION")) {
    return { headline: phrase.label, lemma: null };
  }
  if (phrase?.type === "COLLOCATION") {
    return { headline: phrase.label, lemma: detail.occurrence.lemma };
  }

  const original = detail.occurrence.original.trim();
  const lemma = isDisplayableUiText(detail.occurrence.lemma)
    ? detail.occurrence.lemma.trim()
    : null;

  return {
    headline: original || lemma || "",
    lemma: lemma && lemma !== original ? lemma : null,
  };
}

export function buildReaderMicroscopeView(
  detail: WordDetailGraph,
  textIndex: ReaderTextPhraseIndex | null,
): ReaderMicroscopeView {
  const { occurrence, lemmaKnowledge } = detail;
  const { headline, lemma } = pickHeadline(detail);
  const semantic = resolveWordSemanticData(detail);
  const translation =
    semantic.primaryMeanings.join(" · ") ||
    lemmaKnowledge?.primaryTranslation ||
    null;

  const cefr = estimateCefr(detail);
  const metadataLine = buildMetadataLine(occurrence.partOfSpeech, cefr);
  const frequencyLabel = formatFrequencyLabel(
    lemmaKnowledge,
    occurrence.frequency,
    detail.domain.lemma?.frequencyTier ?? null,
  );

  const sections: MicroscopeSection[] = [];
  const phraseType = detail.phraseOccurrence?.type;

  if (phraseType === "COLLOCATION") {
    const collocation = buildCollocationSection(detail, textIndex);
    if (collocation) {
      sections.push(collocation);
    }
  } else if (phraseType === "FIXED_EXPRESSION" || phraseType === "NATIVE_CONSTRUCTION") {
    const expression = buildExpressionSection(detail);
    if (expression) {
      sections.push(expression);
    }
  } else {
    switch (occurrence.partOfSpeech) {
      case "verb":
        {
          const verb = buildVerbSection(detail, textIndex);
          if (verb) {
            sections.push(verb);
          }
        }
        break;
      case "noun":
        {
          const noun = buildNounSection(detail);
          if (noun) {
            sections.push(noun);
          }
        }
        break;
      case "adjective":
        {
          const adjective = buildAdjectiveSection(detail);
          if (adjective) {
            sections.push(adjective);
          }
        }
        break;
      default:
        {
          const generic = buildGenericSection(detail);
          if (generic) {
            sections.push(generic);
          }
        }
        break;
    }
  }

  const ending = buildEndingSection(detail);
  if (ending) {
    sections.push(ending);
  }

  const caseSection = buildCaseSection(detail);
  if (caseSection) {
    sections.push(caseSection);
  }

  return {
    headline,
    lemma,
    translation,
    metadataLine: phraseType ? null : metadataLine,
    frequencyLabel: phraseType ? null : frequencyLabel,
    sections,
  };
}

export type { PhraseGroupType };
