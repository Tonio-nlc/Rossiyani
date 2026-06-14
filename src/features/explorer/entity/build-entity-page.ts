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
  enrichConceptPage,
  enrichCuratedPage,
  enrichLemmaCuratedPage,
  enrichPhraseKnowledgePage,
} from "./enrich-page-data";
import {
  curatedCandidateHref,
  CURATED_TYPE_LABELS,
  genericDescriptionForCurated,
  genericDescriptionForPhraseType,
} from "./paths";
import {
  findCuratedByRelation,
  findCuratedCandidateExact,
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

  return phrases.map((phrase) => {
    const curated = findCuratedCandidateExact(phrase.label);
    return {
      label: phrase.label,
      href:
        phrase.type === "COLLOCATION"
          ? collocationPath(phrase.label)
          : expressionPath(phrase.label),
      typeBadge: PHRASE_GROUP_TYPE_LABELS[phrase.type],
      translation: curated?.subtitle ?? undefined,
    };
  });
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
        typeBadge: "Word",
      });
      continue;
    }

    const phrase = await prisma.knowledgePhrase.findUnique({
      where: { labelKey: key },
      select: { label: true, type: true },
    });
    if (phrase) {
      seen.add(key);
      const curated = findCuratedCandidateExact(phrase.label);
      picks.push({
        label: phrase.label,
        href:
          phrase.type === "COLLOCATION"
            ? collocationPath(phrase.label)
            : expressionPath(phrase.label),
        typeBadge: PHRASE_GROUP_TYPE_LABELS[phrase.type],
        translation: curated?.subtitle ?? undefined,
      });
      continue;
    }

    const curated = findCuratedByRelation(relation);
    if (curated) {
      seen.add(key);
      picks.push({
        label: curated.lemma,
        href: curatedCandidateHref(curated),
        typeBadge: CURATED_TYPE_LABELS[curated.type],
        translation: curated.subtitle ?? undefined,
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
  const merged = dedupePicks([
    ...relatedExpressions.map((pick) => ({ ...pick, reason: pick.reason ?? "Similar meaning" })),
    ...relationPicks.map((pick) => ({
      ...pick,
      reason: pick.reason ?? "Commonly learned together",
    })),
    ...relatedGrammar.map((pick) => ({ ...pick, reason: pick.reason ?? "Grammar neighbour" })),
  ]);

  if (merged.length >= 4) {
    return merged.slice(0, 4);
  }

  const popular = getPopularCuratedConstructions(4 - merged.length).map((candidate) => ({
    label: candidate.lemma,
    href: curatedCandidateHref(candidate),
    translation: candidate.subtitle ?? undefined,
    typeBadge: CURATED_TYPE_LABELS[candidate.type],
    reason: "Editor's pick",
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
    typeBadge: "Grammar",
  }));
  const relationPicks = await resolveRelationPicks([]);

  const examples: ExplorerEntityExample[] =
    knowledge.exampleSentences.length > 0
      ? knowledge.exampleSentences.map((sentence) => ({ russian: sentence }))
      : relatedExpressions.slice(0, 4).map((item) => ({
          russian: item.label,
          translation: item.translation,
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

  const base: ExplorerEntityPageData = {
    kind: phraseKind(routeHint),
    label: knowledge.label,
    translation: undefined,
    typeLabel,
    badges: [],
    metadataLine: typeLabel,
    description:
      knowledge.canonicalExplanation?.trim() || genericDescriptionForPhraseType(knowledge.type),
    examples,
    relatedExpressions,
    relatedGrammar,
    relatedTexts,
    relatedLessons,
    continueExploring: buildContinueExploring(relatedExpressions, relatedGrammar, relationPicks),
    textCount: knowledge.seenInTexts,
    practiceStructure: knowledge.label,
    breadcrumb: breadcrumbForPhrase(routeHint, knowledge.label),
  };

  return enrichPhraseKnowledgePage(base, knowledge);
}

export async function buildEntityPageFromCuratedPhrase(
  curated: FeaturedCandidateRow,
  routeHint: PhraseRouteHint,
): Promise<ExplorerEntityPageData> {
  const relationPicks = await resolveRelationPicks(curatedRelations(curated));
  const relatedGrammar =
    curated.type === "GRAMMAR"
      ? [{ label: curated.lemma, href: conceptPath(curated.lemma), typeBadge: "Grammar" }]
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
    : relationPicks.slice(0, 4).map((item) => ({
        russian: item.label,
        translation: item.translation,
      }));

  const relatedLessons = findLemmaRelatedLessons(curated.lemma, []);
  const typeLabel = CURATED_TYPE_LABELS[curated.type] ?? curated.type;

  const base: ExplorerEntityPageData = {
    kind: phraseKind(routeHint),
    label: curated.lemma,
    translation: curated.subtitle ?? undefined,
    typeLabel,
    badges: [],
    metadataLine: typeLabel,
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
    textCount: 0,
    practiceStructure: curated.lemma,
    breadcrumb: breadcrumbForPhrase(routeHint, curated.lemma),
  };

  return enrichCuratedPage(base, curated);
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
    : relationPicks.slice(0, 4).map((item) => ({
        russian: item.label,
        translation: item.translation,
      }));

  const relatedLessons = findLemmaRelatedLessons(curated.lemma, []);
  const typeLabel = CURATED_TYPE_LABELS.WORD;

  const base: ExplorerEntityPageData = {
    kind: "lemma",
    label: curated.lemma,
    translation: curated.subtitle ?? undefined,
    typeLabel,
    badges: [],
    metadataLine: typeLabel,
    description: curated.explanation?.trim() || genericDescriptionForCurated(curated),
    examples,
    relatedExpressions: relationPicks.filter((pick) => !pick.href.includes("/lemmas/")),
    relatedGrammar: [],
    relatedTexts: [],
    relatedLessons,
    continueExploring: buildContinueExploring(relationPicks, [], []),
    textCount: 0,
    practiceStructure: curated.lemma,
    breadcrumb: [
      { label: "Explorer", href: "/explorer" },
      { label: "Vocabulary", href: "/explorer/lemmas" },
      { label: curated.lemma },
    ],
  };

  return enrichLemmaCuratedPage(base, curated);
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
    : relationPicks.slice(0, 4).map((item) => ({
        russian: item.label,
        translation: item.translation,
      }));

  const typeLabel = CURATED_TYPE_LABELS.GRAMMAR;

  const base: ExplorerEntityPageData = {
    kind: "concept",
    label: curated.lemma,
    translation: curated.subtitle ?? undefined,
    typeLabel,
    badges: [],
    metadataLine: typeLabel,
    description: curated.explanation?.trim() || genericDescriptionForCurated(curated),
    examples,
    relatedExpressions: relationPicks,
    relatedGrammar: [],
    relatedTexts: [],
    relatedLessons: findLemmaRelatedLessons(curated.lemma, []),
    continueExploring: buildContinueExploring(relationPicks, [], []),
    textCount: 0,
    practiceStructure: curated.lemma,
    breadcrumb: [
      { label: "Explorer", href: "/explorer" },
      { label: "Grammar patterns", href: "/explorer/concepts" },
      { label: curated.lemma },
    ],
  };

  return enrichCuratedPage(base, curated);
}

export function buildEntityPageFromConceptKnowledge(
  concept: ConceptKnowledge,
  relatedTexts: Array<{ textId: string; textTitle: string; sentenceRussian: string }>,
): ExplorerEntityPageData {
  const relatedGrammar = concept.relatedConcepts.map((item) => ({
    label: item.title,
    href: conceptPath(item.conceptKey),
    typeBadge: "Grammar",
  }));

  const relatedExpressions = concept.phrases.map((phrase) => ({
    label: phrase.label,
    href:
      phrase.type === "COLLOCATION"
        ? collocationPath(phrase.label)
        : expressionPath(phrase.label),
    typeBadge: PHRASE_GROUP_TYPE_LABELS[phrase.type],
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

  const base: ExplorerEntityPageData = {
    kind: "concept",
    label: concept.concept.title,
    translation: undefined,
    typeLabel: "Grammar",
    badges: [],
    metadataLine: "Grammar",
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
        typeBadge: "Word",
      })),
    ),
    textCount: new Set(relatedTexts.map((text) => text.textId)).size,
    practiceStructure: concept.concept.title,
    breadcrumb: [
      { label: "Explorer", href: "/explorer" },
      { label: "Grammar patterns", href: "/explorer/concepts" },
      { label: concept.concept.title },
    ],
  };

  return enrichConceptPage(base);
}
