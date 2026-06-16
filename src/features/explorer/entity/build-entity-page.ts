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
  isConceptExplorerEligible,
  isPhraseExplorerEligible,
} from "./explorer-eligibility";
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

function curatedRelations(candidate: FeaturedCandidateRow): string[] {
  if (!Array.isArray(candidate.relations)) {
    return [];
  }
  return candidate.relations.filter((item): item is string => typeof item === "string");
}

function phraseHref(label: string, type: string): string | null {
  if (!isPhraseExplorerEligible(label, type)) {
    return null;
  }
  return type === "COLLOCATION" ? collocationPath(label) : expressionPath(label);
}

async function resolveConceptRelationPicks(relations: string[]): Promise<ExplorerEntityPick[]> {
  const picks: ExplorerEntityPick[] = [];
  const seen = new Set<string>();

  for (const relation of relations) {
    const key = phraseLookupKey(relation);
    if (seen.has(key)) {
      continue;
    }

    const curated = findCuratedByRelation(relation) ?? findCuratedCandidateExact(relation);
    if (curated) {
      const href = curatedCandidateHref(curated);
      if (seen.has(href)) {
        continue;
      }
      seen.add(key);
      seen.add(href);
      picks.push({
        label: curated.lemma,
        href,
        typeBadge:
          curated.type === "GRAMMAR" || curated.type === "CONSTRUCTION"
            ? "Concept"
            : CURATED_TYPE_LABELS[curated.type],
        translation: curated.subtitle ?? undefined,
      });
      continue;
    }

    const concept = await prisma.knowledgeConcept.findFirst({
      where: {
        OR: [
          { conceptKey: { equals: relation, mode: "insensitive" } },
          { title: { equals: relation, mode: "insensitive" } },
        ],
      },
      select: { conceptKey: true, title: true, category: true },
    });
    if (concept && isConceptExplorerEligible(concept.conceptKey, concept.title, concept.category)) {
      const href = conceptPath(concept.conceptKey);
      if (seen.has(href)) {
        continue;
      }
      seen.add(key);
      seen.add(href);
      picks.push({
        label: concept.title,
        href,
        typeBadge: "Concept",
      });
      continue;
    }

    const lemma = await prisma.knowledgeLemma.findFirst({
      where: { lemma: { equals: relation, mode: "insensitive" } },
      select: { lemma: true, partOfSpeech: true },
    });
    if (lemma) {
      const href = lemmaPath(lemma.lemma, lemma.partOfSpeech);
      if (seen.has(href)) {
        continue;
      }
      seen.add(key);
      seen.add(href);
      picks.push({
        label: lemma.lemma,
        href,
        typeBadge: "Word",
      });
      continue;
    }

    const phrase = await prisma.knowledgePhrase.findUnique({
      where: { labelKey: key },
      select: { label: true, type: true },
    });
    if (phrase) {
      const href = phraseHref(phrase.label, phrase.type);
      if (!href || seen.has(href)) {
        continue;
      }
      seen.add(key);
      seen.add(href);
      picks.push({
        label: phrase.label,
        href,
        typeBadge: PHRASE_GROUP_TYPE_LABELS[phrase.type],
      });
    }
  }

  return picks;
}

async function fetchRelatedConceptPicks(
  conceptIds: string[],
  curatedRelations: string[],
  excludeLabel?: string,
): Promise<ExplorerEntityPick[]> {
  const picks: ExplorerEntityPick[] = [];
  const seen = new Set<string>();

  const add = (pick: ExplorerEntityPick) => {
    if (seen.has(pick.href)) {
      return;
    }
    if (excludeLabel && phraseLookupKey(pick.label) === phraseLookupKey(excludeLabel)) {
      return;
    }
    seen.add(pick.href);
    picks.push(pick);
  };

  for (const pick of await resolveConceptRelationPicks(curatedRelations)) {
    add(pick);
  }

  if (conceptIds.length > 0) {
    const relations = await prisma.knowledgeConceptRelation.findMany({
      where: { fromConceptId: { in: conceptIds } },
      include: { toConcept: true },
      take: 12,
    });

    for (const relation of relations) {
      const concept = relation.toConcept;
      if (
        !isConceptExplorerEligible(concept.conceptKey, concept.title, concept.category)
      ) {
        continue;
      }
      add({
        label: concept.title,
        href: conceptPath(concept.conceptKey),
        typeBadge: "Concept",
      });
    }

    const linkedPhrases = await prisma.knowledgePhrase.findMany({
      where: {
        conceptLinks: { some: { conceptId: { in: conceptIds } } },
        ...(excludeLabel ? { NOT: { labelKey: phraseLookupKey(excludeLabel) } } : {}),
      },
      orderBy: { occurrenceCount: "desc" },
      take: 8,
      select: { label: true, type: true },
    });

    for (const phrase of linkedPhrases) {
      const href = phraseHref(phrase.label, phrase.type);
      if (!href) {
        continue;
      }
      add({
        label: phrase.label,
        href,
        typeBadge: PHRASE_GROUP_TYPE_LABELS[phrase.type],
      });
    }
  }

  return picks.slice(0, 8);
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
  relatedConcepts: ExplorerEntityPick[],
  relatedGrammar: ExplorerEntityPick[],
  relationPicks: ExplorerEntityPick[],
): ExplorerEntityPick[] {
  const merged = dedupePicks([
    ...relatedConcepts.map((pick) => ({ ...pick, reason: pick.reason ?? "Related concept" })),
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
  const curated = findCuratedCandidateExact(knowledge.label);
  const relatedConcepts = await fetchRelatedConceptPicks(
    conceptIds,
    curated ? curatedRelations(curated) : [],
    knowledge.label,
  );
  const relatedGrammar = knowledge.concepts.map((concept) => ({
    label: concept.title,
    href: conceptPath(concept.conceptKey),
    typeBadge: "Grammar",
  }));

  const examples: ExplorerEntityExample[] =
    knowledge.exampleSentences.length > 0
      ? knowledge.exampleSentences.map((sentence) => ({ russian: sentence }))
      : relatedConcepts.slice(0, 4).map((item) => ({
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
    translation: curated?.subtitle ?? undefined,
    typeLabel,
    badges: [],
    metadataLine: typeLabel,
    description:
      knowledge.canonicalExplanation?.trim() || genericDescriptionForPhraseType(knowledge.type),
    examples,
    relatedConcepts,
    relatedGrammar,
    relatedTexts,
    relatedLessons,
    continueExploring: buildContinueExploring(relatedConcepts, relatedGrammar, []),
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
  const relationPicks = await resolveConceptRelationPicks(curatedRelations(curated));
  const relatedConcepts = relationPicks;
  const relatedGrammar =
    curated.type === "GRAMMAR"
      ? [{ label: curated.lemma, href: conceptPath(curated.lemma), typeBadge: "Grammar" }]
      : [];

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
    relatedConcepts,
    relatedGrammar,
    relatedTexts: [],
    relatedLessons,
    continueExploring: buildContinueExploring(relatedConcepts, relatedGrammar, []),
    textCount: 0,
    practiceStructure: curated.lemma,
    breadcrumb: breadcrumbForPhrase(routeHint, curated.lemma),
  };

  return enrichCuratedPage(base, curated);
}

export async function buildEntityPageFromLemmaCurated(
  curated: FeaturedCandidateRow,
): Promise<ExplorerEntityPageData> {
  const relationPicks = await resolveConceptRelationPicks(curatedRelations(curated));

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
    relatedConcepts: relationPicks,
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
  const relationPicks = await resolveConceptRelationPicks(curatedRelations(curated));

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
    relatedConcepts: relationPicks,
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

  const relatedConcepts = dedupePicks([
    ...concept.phrases.flatMap((phrase) => {
      const href = phraseHref(phrase.label, phrase.type);
      if (!href) {
        return [];
      }
      return [
        {
          label: phrase.label,
          href,
          typeBadge: PHRASE_GROUP_TYPE_LABELS[phrase.type],
        },
      ];
    }),
    ...concept.lemmas.map((lemma) => ({
      label: lemma.lemma,
      href: lemmaPath(lemma.lemma, lemma.partOfSpeech),
      typeBadge: "Word",
    })),
  ]);

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
    relatedConcepts,
    relatedGrammar,
    relatedTexts: relatedTexts.map((text) => ({
      russian: text.sentenceRussian,
      textId: text.textId,
      textTitle: text.textTitle,
    })),
    relatedLessons: findLemmaRelatedLessons(concept.concept.title, concept.relatedConcepts),
    continueExploring: buildContinueExploring(
      relatedConcepts,
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
