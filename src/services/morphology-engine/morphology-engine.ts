import { formatCaseTitleFr, normalizeCaseKey } from "@/lib/grammar/normalize-case-key";
import { pickCanonicalExplanation } from "@/services/knowledge-graph/graph-mappers";
import { knowledgeGraphService } from "@/services/knowledge-graph";
import type { MorphologyEngineInput, MorphologyEngineOutput } from "@/types/morphology-engine";

const CASE_QUESTIONS: Record<string, string> = {
  nominative: "Qui ? Quoi ? (sujet)",
  genitive: "De qui ? De quoi ?",
  dative: "À qui ? À quoi ?",
  accusative: "Qui ? Quoi ? (complément)",
  instrumental: "Avec qui ? Avec quoi ? / Par qui ?",
  prepositional: "Où ? Sur quoi ? À propos de quoi ?",
  locative: "Où ? (lieu précis)",
};

const CASE_LABELS_FR: Record<string, string> = {
  nominative: "nominatif",
  genitive: "génitif",
  dative: "datif",
  accusative: "accusatif",
  instrumental: "instrumental",
  prepositional: "prépositionnel",
  locative: "locatif",
};

/**
 * Canonical pedagogical explanation generator — independent of Reader UI.
 * Composes knowledge from LinguisticLibrary + KnowledgeGraph.
 */
export async function analyzeMorphology(
  input: MorphologyEngineInput,
): Promise<MorphologyEngineOutput> {
  const [lemmaGraph, endingGraph] = await Promise.all([
    knowledgeGraphService.getLemmaGraph(input.lemma, input.partOfSpeech),
    input.ending
      ? knowledgeGraphService.getEndingGraph(input.ending, input.case)
      : Promise.resolve(null),
  ]);

  const caseKey = normalizeCaseKey(input.case);
  const questionAnswered = caseKey ? (CASE_QUESTIONS[caseKey] ?? null) : null;

  const preposition =
    input.context?.previousWord?.partOfSpeech === "preposition"
      ? input.context.previousWord.original
      : null;

  const currentForm = lemmaGraph?.forms.find(
    (f) => f.original === (input.original ?? input.lemma),
  );

  const canonicalExplanation =
    lemmaGraph?.lemma.canonicalExplanation ??
    (currentForm
      ? pickCanonicalExplanation(currentForm.canonicalExplanation, currentForm.explanation)
      : null) ??
    (endingGraph
      ? pickCanonicalExplanation(
          endingGraph.ending.canonicalExplanation,
          endingGraph.ending.explanationFr,
        )
      : null) ??
    buildFallbackExplanation(input);

  const frenchComparison =
    lemmaGraph?.lemma.frenchComparison ??
    (preposition && caseKey
      ? `En français, « ${preposition} » ne montre pas le cas sur le nom ; en russe, la terminaison ${input.ending ? `« ${input.ending} »` : ""} répond à la question du ${formatCaseTitleFr(caseKey).toLowerCase()}.`
      : null);

  const relatedConcepts = [
    ...(lemmaGraph?.concepts ?? []),
    ...(endingGraph?.concepts ?? []),
  ].filter(
    (concept, index, arr) => arr.findIndex((c) => c.id === concept.id) === index,
  );

  const similarExamples = [
    ...(lemmaGraph?.exampleSentences ?? []),
    ...(endingGraph?.forms.map((f) => f.original) ?? []),
  ].slice(0, 8);

  const reason =
    (endingGraph
      ? pickCanonicalExplanation(
          endingGraph.ending.canonicalExplanation,
          endingGraph.ending.explanationFr,
        )
      : null) ??
    (caseKey
      ? `Forme au ${CASE_LABELS_FR[caseKey] ?? caseKey}${preposition ? ` après « ${preposition} »` : ""}.`
      : canonicalExplanation);

  return {
    stem: input.stem ?? input.lemma,
    ending: input.ending,
    reason,
    questionAnswered,
    preposition,
    canonicalExplanation,
    frenchComparison,
    relatedConcepts,
    similarExamples,
  };
}

function buildFallbackExplanation(input: MorphologyEngineInput): string {
  const caseKey = normalizeCaseKey(input.case);
  const caseFr = caseKey ? CASE_LABELS_FR[caseKey] : null;
  if (caseFr && input.ending) {
    return `Forme « ${input.original ?? input.lemma} » : lemme « ${input.lemma} » + terminaison « ${input.ending} » (${caseFr}).`;
  }
  return `Forme « ${input.original ?? input.lemma} » du lemme « ${input.lemma} ».`;
}
