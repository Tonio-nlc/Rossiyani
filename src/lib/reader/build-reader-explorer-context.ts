import { formatCaseLabelFr, normalizeCaseKey, POS_LABELS_FR } from "@/features/grammar";
import type { ReaderTextData } from "@/features/texts";
import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import { buildLinguisticExplanation } from "@/lib/reader/build-linguistic-explanation";
import {
  isSentenceLevelExplanation,
  WORD_EXPLANATION_EMPTY,
} from "@/lib/formatting/word-explanation-guard";
import { isDisplayableUiText, isTranslationOnlyLine } from "@/lib/formatting/ui-placeholder-guard";
import {
  formatAspectFr,
  formatGenderFr,
  formatNumberFr,
} from "@/lib/formatting/word-morphology-display";
import type { PartOfSpeech } from "@/types/domain";
import type { WordDetailGraph } from "@/types/word-detail-graph";

export type ExplorerContextRelationship = {
  term: string;
  description: string;
};

export type ExplorerContextView = {
  available: boolean;
  selectedWord: string;
  roleBullets: string[];
  naturalMeaning: string | null;
  sentenceFunction: string | null;
  relationships: ExplorerContextRelationship[];
};

type ReaderSentence = ReaderTextData["sentences"][number];
type ReaderSentenceWord = ReaderSentence["words"][number];

const CASE_FUNCTION_FR: Record<string, string> = {
  nominative: "Sujet",
  genitive: "Possession ou partitif",
  dative: "Complément d'objet indirect",
  accusative: "Complément d'objet direct",
  instrumental: "Instrument ou moyen",
  prepositional: "Lieu ou thème",
  locative: "Lieu",
};

const POSSESSIVE_PATTERN =
  /^(мой|моя|моё|мои|твой|твоя|твоё|твои|его|её|ее|наш|наша|наше|наши|ваш|ваша|ваше|ваши|свой|своя|своё|свои)$/i;

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function isDuplicateExplorerText(a: string, b: string): boolean {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) {
    return false;
  }
  return left === right || left.includes(right) || right.includes(left);
}

function dedupeBullets(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const key = normalizeText(value);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(value);
  }
  return result;
}

function isRedundantWithSentenceTranslation(
  text: string,
  snapshot: ReaderWordSnapshot,
): boolean {
  const normalized = normalizeText(text);
  if (!normalized) {
    return true;
  }
  const candidates = [snapshot.naturalTranslation, snapshot.literalTranslation]
    .filter(Boolean)
    .map((value) => normalizeText(value as string));
  return candidates.some(
    (candidate) =>
      candidate === normalized ||
      candidate.includes(normalized) ||
      normalized.includes(candidate),
  );
}

function isUsefulContextExplanation(
  text: string,
  partOfSpeech: PartOfSpeech,
  snapshot: ReaderWordSnapshot,
): boolean {
  const trimmed = text.trim();
  if (
    !isDisplayableUiText(trimmed) ||
    trimmed === WORD_EXPLANATION_EMPTY ||
    isTranslationOnlyLine(trimmed) ||
    isSentenceLevelExplanation(trimmed, partOfSpeech) ||
    isRedundantWithSentenceTranslation(trimmed, snapshot)
  ) {
    return false;
  }
  return true;
}

function resolveCaseFunction(caseValue: string | null): string | null {
  const caseKey = normalizeCaseKey(caseValue);
  if (!caseKey) {
    return null;
  }
  return CASE_FUNCTION_FR[caseKey] ?? null;
}

function findAgreementTarget(
  sentence: ReaderSentence,
  wordPosition: number,
): string | null {
  const selected = sentence.words.find((word) => word.position === wordPosition);
  if (!selected || selected.partOfSpeech !== "adjective") {
    return null;
  }

  for (const word of sentence.words) {
    if (word.position > wordPosition && word.position <= wordPosition + 2) {
      if (word.partOfSpeech === "noun") {
        return word.stressMarked || word.original;
      }
    }
  }

  return null;
}

function buildRoleBullets(
  detail: WordDetailGraph,
  snapshot: ReaderWordSnapshot,
  agreementTarget: string | null,
): string[] {
  const bullets: string[] = [];
  const { occurrence } = detail;
  const caseFunction = resolveCaseFunction(occurrence.case ?? snapshot.case);
  const posLabel = POS_LABELS_FR[occurrence.partOfSpeech as PartOfSpeech] ?? occurrence.partOfSpeech;
  const numberLabel = formatNumberFr(occurrence.number ?? snapshot.number);
  const genderLabel = formatGenderFr(occurrence.gender ?? snapshot.gender);
  const aspectLabel = formatAspectFr(occurrence.aspect ?? snapshot.aspect);

  if (caseFunction) {
    bullets.push(caseFunction.toLowerCase());
  }

  if (detail.contextLabel?.trim()) {
    bullets.push(detail.contextLabel.trim());
  }

  if (posLabel) {
    const numberPart = numberLabel ? ` ${numberLabel.toLowerCase()}` : "";
    bullets.push(`${numberPart.trim() || ""} ${posLabel}`.trim());
  }

  if (genderLabel && occurrence.partOfSpeech !== "verb") {
    bullets.push(`forme ${genderLabel.toLowerCase()}`);
  }

  if (aspectLabel && occurrence.partOfSpeech === "verb") {
    bullets.push(`verbe ${aspectLabel.toLowerCase()}`);
  }

  if (agreementTarget && occurrence.partOfSpeech === "adjective") {
    bullets.push(`s'accorde avec ${agreementTarget}`);
  }

  const tier = detail.lemmaKnowledge?.frequencyTier?.toLowerCase();
  if (tier === "core" || tier === "high" || occurrence.frequency === "common") {
    bullets.push("vocabulaire courant");
  }

  return dedupeBullets(bullets).slice(0, 6);
}

function buildNaturalMeaning(
  detail: WordDetailGraph,
  snapshot: ReaderWordSnapshot,
  agreementTarget: string | null,
  grammarProse: string | null,
): string | null {
  const { occurrence } = detail;
  const candidates: string[] = [];

  const phraseExplanation = detail.phraseOccurrence?.explanation?.trim();
  if (
    phraseExplanation &&
    isUsefulContextExplanation(phraseExplanation, occurrence.partOfSpeech, snapshot)
  ) {
    candidates.push(phraseExplanation);
  }

  const grammaticalReason = detail.grammaticalReason?.trim();
  if (
    grammaticalReason &&
    grammaticalReason !== detail.canonicalExplanation?.trim() &&
    isUsefulContextExplanation(grammaticalReason, occurrence.partOfSpeech, snapshot) &&
    (!grammarProse || !isDuplicateExplorerText(grammaticalReason, grammarProse))
  ) {
    candidates.push(grammaticalReason);
  }

  for (const note of buildLinguisticExplanation(occurrence, {
    agreementTarget,
    frequencyTier: detail.lemmaKnowledge?.frequencyTier ?? null,
  })) {
    if (
      isUsefulContextExplanation(note, occurrence.partOfSpeech, snapshot) &&
      (!grammarProse || !isDuplicateExplorerText(note, grammarProse))
    ) {
      candidates.push(note);
    }
  }

  const simple = detail.lemmaKnowledge?.simpleExplanation?.trim();
  if (
    simple &&
    isUsefulContextExplanation(simple, occurrence.partOfSpeech, snapshot) &&
    (!grammarProse || !isDuplicateExplorerText(simple, grammarProse))
  ) {
    candidates.push(simple);
  }

  const unique = dedupeBullets(candidates);
  return unique[0] ?? null;
}

function buildSentenceFunction(
  detail: WordDetailGraph,
  snapshot: ReaderWordSnapshot,
): string | null {
  const caseFunction = resolveCaseFunction(detail.occurrence.case ?? snapshot.case);
  if (caseFunction) {
    return caseFunction;
  }

  const pos = POS_LABELS_FR[detail.occurrence.partOfSpeech as PartOfSpeech];
  if (pos === "Verbe") {
    return "Prédicat";
  }
  if (pos === "Adjectif") {
    return "Modificateur";
  }
  if (pos === "Adverbe") {
    return "Complément circonstanciel";
  }
  if (pos === "Préposition") {
    return "Préposition";
  }

  return null;
}

function describeRelationship(
  neighbor: ReaderSentenceWord,
  selected: ReaderSentenceWord,
  direction: "before" | "after",
): ExplorerContextRelationship | null {
  const term = neighbor.stressMarked || neighbor.original;
  const selectedTerm = selected.stressMarked || selected.original;

  if (neighbor.partOfSpeech === "adjective" && direction === "before") {
    return { term, description: `décrit ${selectedTerm}` };
  }

  if (POSSESSIVE_PATTERN.test(neighbor.original) && direction === "before") {
    return { term, description: "modificateur possessif" };
  }

  if (neighbor.partOfSpeech === "preposition" && direction === "before") {
    const caseLabel = formatCaseLabelFr(selected.case);
    return {
      term,
      description: caseLabel
        ? `régit la forme au ${caseLabel.toLowerCase()}`
        : "régit ce mot",
    };
  }

  if (neighbor.partOfSpeech === "verb" && direction === "after") {
    return { term, description: `action impliquant ${selectedTerm}` };
  }

  if (
    selected.partOfSpeech === "noun" &&
    neighbor.partOfSpeech === "verb" &&
    direction === "before"
  ) {
    return { term, description: `verbe lié à ${selectedTerm}` };
  }

  if (
    selected.partOfSpeech === "verb" &&
    neighbor.partOfSpeech === "noun" &&
    direction === "after"
  ) {
    return { term, description: `agit sur ${term}` };
  }

  return null;
}

function buildRelationships(
  sentence: ReaderSentence | null | undefined,
  snapshot: ReaderWordSnapshot,
): ExplorerContextRelationship[] {
  if (!sentence) {
    return [];
  }

  const selected = sentence.words.find((word) => word.id === snapshot.id);
  if (!selected) {
    return [];
  }

  const relationships: ExplorerContextRelationship[] = [];
  const seen = new Set<string>();

  const add = (relationship: ExplorerContextRelationship | null) => {
    if (!relationship) {
      return;
    }
    const key = `${normalizeText(relationship.term)}:${normalizeText(relationship.description)}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    relationships.push(relationship);
  };

  const prev = sentence.words.find((word) => word.position === selected.position - 1);
  const next = sentence.words.find((word) => word.position === selected.position + 1);
  const prev2 = sentence.words.find((word) => word.position === selected.position - 2);

  add(prev ? describeRelationship(prev, selected, "before") : null);
  add(prev2 ? describeRelationship(prev2, selected, "before") : null);
  add(next ? describeRelationship(next, selected, "after") : null);

  for (const group of sentence.phraseGroups) {
    if (selected.position < group.startPosition || selected.position > group.endPosition) {
      continue;
    }
    const description =
      group.type === "COLLOCATION"
        ? "part of a fixed expression"
        : group.type === "NATIVE_CONSTRUCTION"
          ? "part of a native construction"
          : "part of a phrase unit";
    add({ term: group.label, description });
  }

  return relationships.slice(0, 5);
}

export function buildReaderExplorerContext(input: {
  detail: WordDetailGraph;
  snapshot: ReaderWordSnapshot;
  sentence?: ReaderSentence | null;
  grammarProse?: string | null;
}): ExplorerContextView {
  const { detail, snapshot, sentence, grammarProse = null } = input;
  const agreementTarget = sentence ? findAgreementTarget(sentence, snapshot.position) : null;
  const selectedWord = snapshot.stressMarked || snapshot.original;
  const roleBullets = buildRoleBullets(detail, snapshot, agreementTarget);
  const naturalMeaning = buildNaturalMeaning(detail, snapshot, agreementTarget, grammarProse);
  const sentenceFunction = buildSentenceFunction(detail, snapshot);
  const relationships = buildRelationships(sentence, snapshot);

  const available =
    roleBullets.length > 0 ||
    Boolean(naturalMeaning) ||
    Boolean(sentenceFunction) ||
    relationships.length > 0;

  return {
    available,
    selectedWord,
    roleBullets,
    naturalMeaning,
    sentenceFunction,
    relationships,
  };
}
