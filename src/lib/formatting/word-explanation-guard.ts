import { normalizeForWordFormCompare } from "@/lib/formatting/word-form";
import type { WordDetailGraph } from "@/types/word-detail-graph";

export const WORD_EXPLANATION_EMPTY = "—";

export type ExplanationSource =
  | "word"
  | "KnowledgeForm"
  | "KnowledgeLemma";

export type ExplanationCandidate = {
  source: ExplanationSource;
  entityId: string | null;
  boundLemma: string | null;
  text: string;
};

export type ExplanationValidationResult =
  | { accepted: true; reason: "ok" }
  | { accepted: false; reason: string };

function normalizeLemma(value: string): string {
  return value.trim().toLowerCase().replace(/ё/g, "е");
}

export function lemmaKeysMatch(expected: string, actual: string | null | undefined): boolean {
  if (!actual?.trim()) {
    return false;
  }
  return normalizeLemma(expected) === normalizeLemma(actual);
}

function formMatchesOccurrence(
  form: { original: string; lemmaId?: string },
  occurrence: WordDetailGraph["occurrence"],
  lemmaEntity: WordDetailGraph["domain"]["lemma"],
): boolean {
  if (
    normalizeForWordFormCompare(form.original) !==
    normalizeForWordFormCompare(occurrence.original)
  ) {
    return false;
  }
  if (lemmaEntity && !lemmaKeysMatch(occurrence.lemma, lemmaEntity.lemma)) {
    return false;
  }
  return true;
}

const SENTENCE_LEVEL_PATTERNS = [
  /\bdans (cette |la )?phrase\b/i,
  /\btraduction (naturelle|de la phrase)\b/i,
  /\bce texte\b/i,
  /^le russe\b/i,
  /\bla phrase (entière|complète|russe)\b/i,
  /\bl['']ensemble (de la |du )?(phrase|texte)\b/i,
  /\bstructure (de la |du )?(phrase|texte)\b/i,
  /\bordre (des mots )?dans (cette |la )?phrase\b/i,
  /\bcontexte (de la |du )?(phrase|texte)\b/i,
];

const FUNCTION_WORD_SENTENCE_PATTERNS = [
  /\brelie .{10,} (propositions|clauses|membres)\b/i,
  /\bcoordination entre\b/i,
  /\bsubordonn(?:e|ée|ant) .{15,}\b/i,
];

export function isSentenceLevelExplanation(
  text: string,
  partOfSpeech: WordDetailGraph["occurrence"]["partOfSpeech"],
): boolean {
  const trimmed = text.trim();
  if (!trimmed) {
    return true;
  }

  if (trimmed.length > 220) {
    return true;
  }

  for (const pattern of SENTENCE_LEVEL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }

  if (
    (partOfSpeech === "conjunction" || partOfSpeech === "particle") &&
    FUNCTION_WORD_SENTENCE_PATTERNS.some((pattern) => pattern.test(trimmed))
  ) {
    return true;
  }

  const sentenceCount = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean).length;
  if (sentenceCount > 2 && partOfSpeech !== "verb") {
    return true;
  }

  return false;
}

export function mentionsForeignLexicalConcept(
  text: string,
  detail: WordDetailGraph,
): boolean {
  const lower = text.toLowerCase();
  const lemmaKey = normalizeLemma(detail.occurrence.lemma);
  const originalKey = normalizeLemma(detail.occurrence.original);

  if (/\bjours?\b/i.test(lower)) {
    const dayRelated =
      /ден|дн|jour|day/i.test(lemmaKey + originalKey) ||
      lemmaKey === "день" ||
      originalKey.startsWith("дн");
    if (!dayRelated) {
      return true;
    }
  }

  return false;
}

export function validateWordExplanation(
  candidate: ExplanationCandidate,
  detail: WordDetailGraph,
): ExplanationValidationResult {
  return validateExplanationCandidate(candidate, detail);
}

export function validateExplanationCandidate(
  candidate: ExplanationCandidate,
  detail: WordDetailGraph,
): ExplanationValidationResult {
  const { occurrence } = detail;
  const text = candidate.text.trim();

  if (!text) {
    return { accepted: false, reason: "empty" };
  }

  if (candidate.boundLemma && !lemmaKeysMatch(occurrence.lemma, candidate.boundLemma)) {
    return { accepted: false, reason: "lemma_mismatch" };
  }

  if (isSentenceLevelExplanation(text, occurrence.partOfSpeech)) {
    return { accepted: false, reason: "sentence_level" };
  }

  if (mentionsForeignLexicalConcept(text, detail)) {
    return { accepted: false, reason: "foreign_lexical_concept" };
  }

  return { accepted: true, reason: "ok" };
}

export function logExplanationDecision(
  detail: WordDetailGraph,
  candidate: ExplanationCandidate,
  validation: ExplanationValidationResult,
  text: string | null,
): void {
  console.log(
    `[WORD_EXPLANATION] word=${detail.occurrence.original} lemma=${detail.occurrence.lemma} source=${candidate.source} candidate=${JSON.stringify(candidate.text)} entityId=${candidate.entityId ?? "null"} accepted=${validation.accepted} reason=${validation.reason} text=${text ?? "null"}`,
  );
}

export function collectExplanationCandidates(detail: WordDetailGraph): ExplanationCandidate[] {
  const { occurrence, domain, lemmaKnowledge } = detail;
  const candidates: ExplanationCandidate[] = [];

  if (occurrence.explanation?.trim()) {
    candidates.push({
      source: "word",
      entityId: detail.wordId,
      boundLemma: occurrence.lemma,
      text: occurrence.explanation,
    });
  }

  if (domain.form) {
    const formText =
      domain.form.canonicalExplanation?.trim() || domain.form.explanation?.trim() || "";
    if (formText && formMatchesOccurrence(domain.form, occurrence, domain.lemma)) {
      candidates.push({
        source: "KnowledgeForm",
        entityId: domain.form.id,
        boundLemma: domain.lemma?.lemma ?? occurrence.lemma,
        text: formText,
      });
    }
  }

  if (domain.lemma?.canonicalExplanation?.trim()) {
    candidates.push({
      source: "KnowledgeLemma",
      entityId: domain.lemma.id,
      boundLemma: domain.lemma.lemma,
      text: domain.lemma.canonicalExplanation,
    });
  }

  if (lemmaKnowledge?.canonicalExplanation?.trim()) {
    candidates.push({
      source: "KnowledgeLemma",
      entityId: lemmaKnowledge.lemma,
      boundLemma: lemmaKnowledge.lemma,
      text: lemmaKnowledge.canonicalExplanation,
    });
  }

  return candidates;
}

export function pickReliableExplanationText(
  detail: WordDetailGraph,
): string | null {
  for (const candidate of collectExplanationCandidates(detail)) {
    const validation = validateExplanationCandidate(candidate, detail);
    logExplanationDecision(detail, candidate, validation, validation.accepted ? candidate.text : null);
    if (validation.accepted) {
      return candidate.text;
    }
  }
  return null;
}
