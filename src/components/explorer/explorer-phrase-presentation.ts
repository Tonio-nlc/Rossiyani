import type { Register } from "@prisma/client";

import { lemmaPath } from "@/components/explorer/explorer-routes";
import { findCuratedCandidateExact } from "@/features/explorer/entity/curated-lookup";
import { firstSentence } from "@/features/explorer/entity/types";
import type { PhraseRouteHint } from "@/features/explorer/entity/types";
import type { FeaturedCandidateRow } from "@/features/discovery/types";
import {
  explorerFrequencyLabel,
  explorerRegisterLabel,
  groupOccurrencesByText,
  observedInContexts,
  pickShortExamplesFromOccurrences,
  pickShortSentences,
  type ExplorerLemmaExample,
  type ExplorerMicroscopeData,
  type ExplorerRelatedWord,
  type ExplorerTextOccurrence,
} from "@/lib/explorer/explorer-ia";
import type { PhraseGraph, PhraseKnowledge } from "@/types/knowledge-graph";

export type ExplorerPhrasePresentation = {
  kind: "collocation" | "expression";
  label: string;
  translation: string | null;
  registerBadge: string | null;
  meaning: string;
  whenToUse: string;
  examples: ExplorerLemmaExample[];
  relatedWords: ExplorerRelatedWord[];
  similarExpressions: ExplorerRelatedWord[];
  foundInTexts: ExplorerTextOccurrence[];
  microscope: ExplorerMicroscopeData;
  breadcrumb: Array<{ label: string; href?: string }>;
};

function breadcrumbForPhrase(
  routeHint: PhraseRouteHint,
  label: string,
): Array<{ label: string; href?: string }> {
  return [
    { label: "Explorer", href: "/explorer" },
    {
      label: routeHint === "collocation" ? "Collocations" : "Expressions",
      href: routeHint === "collocation" ? "/explorer/collocations" : "/explorer/expressions",
    },
    { label },
  ];
}

function meaningFromPhrase(
  knowledge: PhraseKnowledge | null,
  curated: FeaturedCandidateRow | null,
  graph: PhraseGraph | null,
): string {
  const explanation =
    knowledge?.canonicalExplanation?.trim() ||
    curated?.explanation?.trim() ||
    graph?.phrase.canonicalExplanation?.trim() ||
    graph?.phrase.explanation?.trim();

  if (explanation) {
    return firstSentence(explanation);
  }

  return knowledge?.label || curated?.lemma || graph?.phrase.label || "Observed in your texts.";
}

function whenToUseFromPhrase(
  knowledge: PhraseKnowledge | null,
  curated: FeaturedCandidateRow | null,
  graph: PhraseGraph | null,
  routeHint: PhraseRouteHint,
): string {
  const textCount = graph?.stats.distinctTexts ?? knowledge?.seenInTexts ?? 0;
  const topics = Array.isArray(curated?.topics)
    ? curated.topics.filter((topic): topic is string => typeof topic === "string")
    : [];

  if (routeHint === "expression" && topics.length > 0) {
    return `Russians use this in contexts like: ${topics.slice(0, 3).join(", ")}.`;
  }

  if (textCount > 0) {
    const textLabel = textCount === 1 ? "1 of your texts" : `${textCount} of your texts`;
    return routeHint === "collocation"
      ? `Native speakers pair these words naturally. You have seen it in ${textLabel}.`
      : `You have encountered this in ${textLabel} — notice when speakers reach for this phrase.`;
  }

  return routeHint === "collocation"
    ? "Native speakers combine these words as a fixed unit, not word by word."
    : "Listen for this when speakers react, summarise, or shift tone in conversation.";
}

function mapRelatedWords(graph: PhraseGraph | null): ExplorerRelatedWord[] {
  if (!graph) {
    return [];
  }

  return graph.relatedLemmas.slice(0, 6).map((lemma) => ({
    label: lemma.lemma,
    href: lemmaPath(lemma.lemma, lemma.partOfSpeech),
    hint: "Appears in the same phrase",
  }));
}

function examplesFromPhrase(
  knowledge: PhraseKnowledge | null,
  curated: FeaturedCandidateRow | null,
  graph: PhraseGraph | null,
): ExplorerLemmaExample[] {
  if (graph && graph.occurrences.length > 0) {
    return pickShortExamplesFromOccurrences(graph.occurrences, 5);
  }

  if (curated?.exampleRussian) {
    return [
      {
        russian: curated.exampleRussian,
        translation: curated.exampleTranslation ?? null,
      },
    ];
  }

  const sentences = knowledge?.exampleSentences ?? graph?.exampleSentences ?? [];
  return pickShortSentences(sentences, 5).map((sentence) => ({
    russian: sentence,
    translation: null,
  }));
}

function foundInTextsFromPhrase(
  knowledge: PhraseKnowledge | null,
  graph: PhraseGraph | null,
): ExplorerTextOccurrence[] {
  if (graph) {
    return groupOccurrencesByText(graph.occurrences);
  }

  return (knowledge?.relatedTexts ?? []).reduce<ExplorerTextOccurrence[]>((acc, text) => {
    const existing = acc.find((item) => item.textId === text.textId);
    if (existing) {
      existing.occurrenceCount += 1;
      return acc;
    }
    acc.push({
      textId: text.textId,
      textTitle: text.textTitle,
      occurrenceCount: 1,
      previewSnippet: text.sentenceRussian
        ? text.sentenceRussian.slice(0, 64)
        : null,
    });
    return acc;
  }, []);
}

export function presentationFromPhrase(input: {
  routeHint: PhraseRouteHint;
  knowledge: PhraseKnowledge | null;
  graph: PhraseGraph | null;
  curated: FeaturedCandidateRow | null;
  similarPhrases: Array<{ label: string; href: string }>;
}): ExplorerPhrasePresentation {
  const { routeHint, knowledge, graph, curated, similarPhrases } = input;
  const label = knowledge?.label ?? curated?.lemma ?? graph?.phrase.label ?? "";
  const occurrenceCount =
    graph?.stats.occurrenceCount ?? knowledge?.occurrenceCount ?? curated?.frequency ?? 0;
  const register = (curated?.register as Register | undefined) ?? "neutral";
  const foundInTexts = foundInTextsFromPhrase(knowledge, graph);
  const relatedWords = mapRelatedWords(graph);
  const similarExpressions = similarPhrases.map((phrase) => ({
    label: phrase.label,
    href: phrase.href,
    hint: "Similar native phrasing",
  }));

  const microscopeBase: ExplorerMicroscopeData = {
    facts: [
      {
        label: "Frequency",
        value: explorerFrequencyLabel(occurrenceCount),
      },
    ],
    linkedTexts: foundInTexts.slice(0, 6),
  };

  if (routeHint === "expression") {
    microscopeBase.facts.unshift({
      label: "Register",
      value: explorerRegisterLabel(register),
    });
    microscopeBase.facts.push({
      label: "In your material",
      value: observedInContexts(occurrenceCount),
    });
    microscopeBase.similarItems = similarExpressions;
  } else {
    microscopeBase.facts.push({
      label: "In your material",
      value: observedInContexts(occurrenceCount),
    });
    microscopeBase.relatedWords = relatedWords;
  }

  return {
    kind: routeHint,
    label,
    translation: curated?.subtitle ?? null,
    registerBadge: routeHint === "expression" ? explorerRegisterLabel(register) : null,
    meaning: meaningFromPhrase(knowledge, curated, graph),
    whenToUse: whenToUseFromPhrase(knowledge, curated, graph, routeHint),
    examples: examplesFromPhrase(knowledge, curated, graph),
    relatedWords,
    similarExpressions,
    foundInTexts,
    breadcrumb: breadcrumbForPhrase(routeHint, label),
    microscope: microscopeBase,
  };
}

export async function buildPhrasePresentationFromKnowledge(
  knowledge: PhraseKnowledge,
  routeHint: PhraseRouteHint,
  graph: PhraseGraph | null,
  similarPhrases: Array<{ label: string; href: string }>,
): Promise<ExplorerPhrasePresentation> {
  const curated = findCuratedCandidateExact(knowledge.label);
  return presentationFromPhrase({
    routeHint,
    knowledge,
    graph,
    curated,
    similarPhrases,
  });
}

export function buildPhrasePresentationFromCurated(
  curated: FeaturedCandidateRow,
  routeHint: PhraseRouteHint,
  similarPhrases: Array<{ label: string; href: string }>,
): ExplorerPhrasePresentation {
  return presentationFromPhrase({
    routeHint,
    knowledge: null,
    graph: null,
    curated,
    similarPhrases,
  });
}
