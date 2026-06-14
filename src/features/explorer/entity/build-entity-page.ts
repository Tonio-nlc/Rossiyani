import type { CefrLevel } from "@prisma/client";

import {
  collocationPath,
  conceptPath,
  expressionPath,
  lemmaPath,
} from "@/components/explorer/explorer-routes";
import type { FeaturedCandidateRow } from "@/features/discovery/types";
import { findLemmaRelatedLessons } from "@/features/knowledge/find-lemma-related-lessons";
import type { PhraseKnowledge } from "@/types/knowledge-graph";
import type { ConceptKnowledge } from "@/types/knowledge-graph";
import { phraseLookupKey } from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";
import { PHRASE_GROUP_TYPE_LABELS } from "@/types/domain";

import {
  curatedCandidateHref,
  CURATED_TYPE_LABELS,
  genericDescriptionForCurated,
  genericDescriptionForPhraseType,
} from "./paths";
import {
  findCuratedByRelation,
  getPopularCuratedConstructions,
} from "./curated-lookup";
import { phraseTypeLabel } from "./resolve-phrase";
import type {
  ExplorerEntityExample,
  ExplorerEntityKind,
  ExplorerEntityPageData,
  ExplorerEntityPick,
  PhraseRouteHint,
} from "./types";
import { buildMetadataLine } from "./types";

async function fetchRelatedPhrasePicks(
  label: string,
  conceptIds: string[],
): Promise<ExplorerEntityPick[]> {
  if (conceptIds.length === 0) {
    return [];
  }

  const phrases = await prisma.knowledgePhrase.findMany({
    where: {
      conceptLinks: { some: { conceptId: { in: conceptIds } } },
      NOT: { labelKey: phraseLookupKey(label) },
    },
    orderBy: { occurrenceCount: "desc" },
    take: 8,
    select: { label: true, type: true },
  });

  return phrases.map((phrase) => ({
    label: phrase.label,
    href:
      phrase.type === "COLLOCATION"
        ? collocationPath(phrase.label)
        : expressionPath(phrase.label),
    meta: PHRASE_GROUP_TYPE_LABELS[phrase.type],
  }));
}

function curatedRelations(candidate: FeaturedCandidateRow): string[] {
  if (!Array.isArray(candidate.relations)) {
    return [];
  }
  return candidate.relations.filter((item): item is string => typeof item === "string");
}

async function resolveRelationPicks(relations: string[]): Promise<ExplorerEntityPick[]> {
  const picks: ExplorerEntityPick[] = [];
  const seen = new Set<string>();

  for (const relation of relations) {
    const key = phraseLookupKey(relation);
    if (seen.has(key)) {
      continue;
    }

    const lemma = await prisma.knowledgeLemma.findFirst({
      where: { lemma: { equals: relation, mode: "insensitive" } },
      select: { lemma: true, partOfSpeech: true },
    });
    if (lemma) {
      seen.add(key);
      picks.push({
        label: lemma.lemma,
        href: lemmaPath(lemma.lemma, lemma.partOfSpeech),
      });
      continue;
    }

    const phrase = await prisma.knowledgePhrase.findUnique({
      where: { labelKey: key },
      select: { label: true, type: true },
    });
    if (phrase) {
      seen.add(key);
      picks.push({
        label: phrase.label,
        href:
          phrase.type === "COLLOCATION"
            ? collocationPath(phrase.label)
            : expressionPath(phrase.label),
      });
      continue;
    }

    const curated = findCuratedByRelation(relation);
    if (curated) {
      seen.add(key);
      picks.push({
        label: curated.lemma,
        href: curatedCandidateHref(curated),
        meta: CURATED_TYPE_LABELS[curated.type],
      });
    }
  }

  return picks;
}

function dedupePicks(items: ExplorerEntityPick[]): ExplorerEntityPick[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.href)) {
      return false;
    }
    seen.add(item.href);
    return true;
  });
}

function buildContinueExploring(
  relatedExpressions: ExplorerEntityPick[],
  relatedGrammar: ExplorerEntityPick[],
  relationPicks: ExplorerEntityPick[],
): ExplorerEntityPick[] {
  const merged = dedupePicks([...relatedExpressions, ...relatedGrammar, ...relationPicks]);
  if (merged.length >= 4) {
    return merged.slice(0, 4);
  }

  const popular = getPopularCuratedConstructions(4 - merged.length).map((candidate) => ({
    label: candidate.lemma,
    href: curatedCandidateHref(candidate),
    meta: candidate.subtitle ?? undefined,
  }));

  return dedupePicks([...merged, ...popular]).slice(0, 4);
}

function phraseKind(routeHint: PhraseRouteHint): ExplorerEntityKind {
  return routeHint === "collocation" ? "collocation" : "expression";
}

function breadcrumbForPhrase(routeHint: PhraseRouteHint, label: string) {
  return [
    { label: "Explorer", href: "/explorer" },
    {
      label: routeHint === "collocation" ? "Collocations" : "Expressions",
      href: routeHint === "collocation" ? "/explorer/collocations" : "/explorer/expressions",
    },
    { label },
  ];
}

export async function buildEntityPageFromPhraseKnowledge(
  knowledge: PhraseKnowledge,
  routeHint: PhraseRouteHint,
): Promise<ExplorerEntityPageData> {
  const conceptIds = knowledge.concepts.map((concept) => concept.id);
  const relatedExpressions = await fetchRelatedPhrasePicks(knowledge.label, conceptIds);
  const relatedGrammar = knowledge.concepts.map((concept) => ({
    label: concept.title,
    href: conceptPath(concept.conceptKey),
  }));
  const relationPicks = await resolveRelationPicks([]);

  const examples: ExplorerEntityExample[] =
    knowledge.exampleSentences.length > 0
      ? knowledge.exampleSentences.map((sentence) => ({ russian: sentence }))
      : relatedExpressions.slice(0, 4).map((item) => ({
          russian: item.label,
        }));

  const relatedTexts: ExplorerEntityExample[] = knowledge.relatedTexts.map((text) => ({
    russian: text.sentenceRussian,
    textId: text.textId,
    textTitle: text.textTitle,
  }));

  const relatedLessons = findLemmaRelatedLessons(
    knowledge.label.split(/\s+/)[0] ?? knowledge.label,
    knowledge.concepts,
  );

  const typeLabel = phraseTypeLabel(knowledge.type);

  return {
    kind: phraseKind(routeHint),
    label: knowledge.label,
    translation: undefined,
    metadataLine: buildMetadataLine(typeLabel),
    description:
      knowledge.canonicalExplanation?.trim() || genericDescriptionForPhraseType(knowledge.type),
    examples,
    relatedExpressions,
    relatedGrammar,
    relatedTexts,
    relatedLessons,
    continueExploring: buildContinueExploring(relatedExpressions, relatedGrammar, relationPicks),
    practiceStructure: knowledge.label,
    breadcrumb: breadcrumbForPhrase(routeHint, knowledge.label),
  };
}

export async function buildEntityPageFromCuratedPhrase(
  curated: FeaturedCandidateRow,
  routeHint: PhraseRouteHint,
): Promise<ExplorerEntityPageData> {
  const relationPicks = await resolveRelationPicks(curatedRelations(curated));
  const relatedGrammar = curated.type === "GRAMMAR"
    ? [{ label: curated.lemma, href: conceptPath(curated.lemma) }]
    : [];

  const relatedExpressions = relationPicks.filter(
    (pick) => pick.href.includes("/expressions/") || pick.href.includes("/collocations/"),
  );
  const relatedWords = relationPicks.filter((pick) => pick.href.includes("/lemmas/"));

  const examples: ExplorerEntityExample[] = curated.exampleRussian
    ? [
        {
          russian: curated.exampleRussian,
          translation: curated.exampleTranslation || undefined,
        },
      ]
    : relationPicks.slice(0, 4).map((item) => ({ russian: item.label }));

  const relatedLessons = findLemmaRelatedLessons(curated.lemma, []);

  const typeLabel = CURATED_TYPE_LABELS[curated.type] ?? curated.type;

  return {
    kind: phraseKind(routeHint),
    label: curated.lemma,
    translation: curated.subtitle ?? undefined,
    metadataLine: buildMetadataLine(typeLabel, curated.difficulty as CefrLevel),
    description: curated.explanation?.trim() || genericDescriptionForCurated(curated),
    examples,
    relatedExpressions: dedupePicks([...relatedExpressions, ...relatedWords]).slice(0, 8),
    relatedGrammar,
    relatedTexts: [],
    relatedLessons,
    continueExploring: buildContinueExploring(
      relatedExpressions,
      relatedGrammar,
      relationPicks,
    ),
    practiceStructure: curated.lemma,
    breadcrumb: breadcrumbForPhrase(routeHint, curated.lemma),
  };
}

export async function buildEntityPageFromLemmaCurated(
  curated: FeaturedCandidateRow,
): Promise<ExplorerEntityPageData> {
  const relationPicks = await resolveRelationPicks(curatedRelations(curated));

  const examples: ExplorerEntityExample[] = curated.exampleRussian
    ? [
        {
          russian: curated.exampleRussian,
          translation: curated.exampleTranslation || undefined,
        },
      ]
    : relationPicks.slice(0, 4).map((item) => ({ russian: item.label }));

  const relatedLessons = findLemmaRelatedLessons(curated.lemma, []);

  return {
    kind: "lemma",
    label: curated.lemma,
    translation: curated.subtitle ?? undefined,
    metadataLine: buildMetadataLine(CURATED_TYPE_LABELS.WORD, curated.difficulty as CefrLevel),
    description: curated.explanation?.trim() || genericDescriptionForCurated(curated),
    examples,
    relatedExpressions: relationPicks.filter((pick) => !pick.href.includes("/lemmas/")),
    relatedGrammar: [],
    relatedTexts: [],
    relatedLessons,
    continueExploring: buildContinueExploring(relationPicks, [], []),
    practiceStructure: curated.lemma,
    breadcrumb: [
      { label: "Explorer", href: "/explorer" },
      { label: "Vocabulary", href: "/explorer/lemmas" },
      { label: curated.lemma },
    ],
  };
}

export async function buildEntityPageFromConceptCurated(
  curated: FeaturedCandidateRow,
): Promise<ExplorerEntityPageData> {
  const relationPicks = await resolveRelationPicks(curatedRelations(curated));

  const examples: ExplorerEntityExample[] = curated.exampleRussian
    ? [
        {
          russian: curated.exampleRussian,
          translation: curated.exampleTranslation || undefined,
        },
      ]
    : relationPicks.slice(0, 4).map((item) => ({ russian: item.label }));

  return {
    kind: "concept",
    label: curated.lemma,
    translation: curated.subtitle ?? undefined,
    metadataLine: buildMetadataLine(CURATED_TYPE_LABELS.GRAMMAR, curated.difficulty as CefrLevel),
    description: curated.explanation?.trim() || genericDescriptionForCurated(curated),
    examples,
    relatedExpressions: relationPicks,
    relatedGrammar: [],
    relatedTexts: [],
    relatedLessons: findLemmaRelatedLessons(curated.lemma, []),
    continueExploring: buildContinueExploring(relationPicks, [], []),
    practiceStructure: curated.lemma,
    breadcrumb: [
      { label: "Explorer", href: "/explorer" },
      { label: "Grammar patterns", href: "/explorer/concepts" },
      { label: curated.lemma },
    ],
  };
}

export function buildEntityPageFromConceptKnowledge(
  concept: ConceptKnowledge,
  relatedTexts: Array<{ textId: string; textTitle: string; sentenceRussian: string }>,
): ExplorerEntityPageData {
  const relatedGrammar = concept.relatedConcepts.map((item) => ({
    label: item.title,
    href: conceptPath(item.conceptKey),
  }));

  const relatedExpressions = concept.phrases.map((phrase) => ({
    label: phrase.label,
    href:
      phrase.type === "COLLOCATION"
        ? collocationPath(phrase.label)
        : expressionPath(phrase.label),
  }));

  const examples: ExplorerEntityExample[] =
    relatedTexts.length > 0
      ? relatedTexts.slice(0, 6).map((text) => ({
          russian: text.sentenceRussian,
          textId: text.textId,
          textTitle: text.textTitle,
        }))
      : concept.lemmas.slice(0, 4).map((lemma) => ({
          russian: lemma.lemma,
        }));

  return {
    kind: "concept",
    label: concept.concept.title,
    translation: undefined,
    metadataLine: buildMetadataLine("Grammar"),
    description:
      concept.concept.canonicalExplanation?.trim() ||
      genericDescriptionForPhraseType("GRAMMAR"),
    examples,
    relatedExpressions,
    relatedGrammar,
    relatedTexts: relatedTexts.map((text) => ({
      russian: text.sentenceRussian,
      textId: text.textId,
      textTitle: text.textTitle,
    })),
    relatedLessons: findLemmaRelatedLessons(concept.concept.title, concept.relatedConcepts),
    continueExploring: buildContinueExploring(
      relatedExpressions,
      relatedGrammar,
      concept.lemmas.map((lemma) => ({
        label: lemma.lemma,
        href: lemmaPath(lemma.lemma, lemma.partOfSpeech),
      })),
    ),
    practiceStructure: concept.concept.title,
    breadcrumb: [
      { label: "Explorer", href: "/explorer" },
      { label: "Grammar patterns", href: "/explorer/concepts" },
      { label: concept.concept.title },
    ],
  };
}