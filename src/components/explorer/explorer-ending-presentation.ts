import type { CaseKey } from "@/features/grammar";
import { getCaseLegendEntry } from "@/features/grammar/case-legend-data";
import { conceptPath, casePath, lemmaPath } from "@/components/explorer/explorer-routes";
import { isCaseConcept } from "@/features/explorer/entity/explorer-eligibility";
import { firstSentence } from "@/features/explorer/entity/types";
import {
  explorerFrequencyLabel,
  groupOccurrencesByText,
  observedInContexts,
  pickShortExamplesFromOccurrences,
  type ExplorerLemmaExample,
  type ExplorerLinkItem,
  type ExplorerMicroscopeData,
  type ExplorerRelatedWord,
  type ExplorerTextOccurrence,
} from "@/lib/explorer/explorer-ia";
import { pickCanonicalExplanation } from "@/services/knowledge-graph/graph-mappers";
import type {
  EndingGraph,
  GraphFormSummary,
  GraphLemmaNode,
} from "@/types/knowledge-graph";

export type ExplorerEndingPresentation = {
  label: string;
  shortDescription: string;
  grammaticalFunction: string;
  commonWords: ExplorerRelatedWord[];
  examples: ExplorerLemmaExample[];
  foundInTexts: ExplorerTextOccurrence[];
  relatedConcepts: ExplorerLinkItem[];
  microscope: ExplorerMicroscopeData;
  breadcrumb: Array<{ label: string; href?: string }>;
};

function lemmaForForm(
  form: GraphFormSummary,
  lemmas: GraphLemmaNode[],
): GraphLemmaNode | null {
  return (
    lemmas.find(
      (lemma) => form.original.startsWith(lemma.lemma) || form.original.includes(lemma.lemma),
    ) ?? null
  );
}

function endingShortDescription(graph: EndingGraph): string {
  const legend = getCaseLegendEntry(graph.ending.caseKey as CaseKey);
  const explanation = firstSentence(
    pickCanonicalExplanation(graph.ending.canonicalExplanation, graph.ending.explanationFr),
  );

  if (explanation) {
    return explanation;
  }

  if (legend) {
    return `${legend.frenchName} ending · ${legend.question}`;
  }

  return "Grammatical ending observed in your texts.";
}

function endingGrammaticalFunction(graph: EndingGraph): string {
  const legend = getCaseLegendEntry(graph.ending.caseKey as CaseKey);
  const explanation = pickCanonicalExplanation(
    graph.ending.canonicalExplanation,
    graph.ending.explanationFr,
  );
  const parts: string[] = [];

  if (legend) {
    parts.push(
      `Appears in the ${legend.frenchName} case (${legend.question.replace(/\s*\(.*\)\s*$/, "").trim()}).`,
    );
  }

  if (explanation) {
    parts.push(firstSentence(explanation));
  } else if (legend?.frenchContrast) {
    parts.push(firstSentence(legend.frenchContrast));
  }

  return parts.join(" ") || "Marks a grammatical role on nouns, adjectives, or pronouns.";
}

function mapRelatedConcepts(graph: EndingGraph): ExplorerLinkItem[] {
  return graph.concepts
    .filter((concept) => !isCaseConcept(concept.conceptKey, concept.category))
    .slice(0, 6)
    .map((concept) => ({
      label: concept.title.replace(/\s+case$/i, "").trim(),
      href: conceptPath(concept.conceptKey),
    }));
}

function mapCommonWords(graph: EndingGraph): ExplorerRelatedWord[] {
  const seen = new Set<string>();

  return [...graph.forms]
    .sort((left, right) => right.occurrenceCount - left.occurrenceCount)
    .reduce<ExplorerRelatedWord[]>((acc, form) => {
      if (seen.has(form.original)) {
        return acc;
      }
      seen.add(form.original);

      const lemma = lemmaForForm(form, graph.lemmas);
      acc.push({
        label: form.original,
        href: lemma
          ? lemmaPath(lemma.lemma, lemma.partOfSpeech)
          : `/explorer?q=${encodeURIComponent(form.original)}`,
      });
      return acc;
    }, [])
    .slice(0, 6);
}

export function presentationFromEnding(graph: EndingGraph): ExplorerEndingPresentation {
  const endingLabel = `-${graph.ending.ending}`;
  const shortDescription = endingShortDescription(graph);
  const foundInTexts = groupOccurrencesByText(graph.occurrences);
  const relatedConcepts = mapRelatedConcepts(graph);
  const legend = getCaseLegendEntry(graph.ending.caseKey as CaseKey);
  const relatedCases: ExplorerLinkItem[] = legend
    ? [{ label: legend.frenchName, href: casePath(graph.ending.caseKey) }]
    : [];

  return {
    label: endingLabel,
    shortDescription,
    grammaticalFunction: endingGrammaticalFunction(graph),
    commonWords: mapCommonWords(graph),
    examples: pickShortExamplesFromOccurrences(graph.occurrences, 5),
    foundInTexts,
    relatedConcepts,
    breadcrumb: [
      { label: "Explorer", href: "/explorer" },
      { label: "Endings", href: "/explorer/endings" },
      { label: endingLabel },
    ],
    microscope: {
      facts: [
        { label: "Function", value: shortDescription },
        { label: "Frequency", value: explorerFrequencyLabel(graph.ending.hitCount) },
        { label: "In your material", value: observedInContexts(graph.stats.occurrenceCount) },
      ],
      relatedCases,
      relatedConcepts,
      linkedTexts: foundInTexts.slice(0, 6),
    },
  };
}
