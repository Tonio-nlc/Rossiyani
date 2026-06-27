import { LEARNABLE_LEMMA_WHERE } from "@/lib/linguistics/lexical-metadata";
import { prisma } from "@/lib/prisma";
import { getLemmaGraph } from "@/services/knowledge-graph/get-lemma-graph";
import {
  collocationPath,
  conceptPath,
  expressionPath,
  lemmaPath,
  textPath,
} from "@/components/explorer/explorer-routes";
import type { KnowledgeChainItem } from "@/components/editorial";

export type HomeConceptEntry = {
  title: string;
  conceptKey: string;
};

export type HomeAtlasTopic = {
  label: string;
  href: string;
};

export type HomeTodaysInsight = {
  insight: string;
  chain: KnowledgeChainItem[];
  openHref: string;
  openLabel: string;
  relatedText: { label: string; href: string } | null;
};

export type HomeWorkspaceStats = {
  knownWords: number;
  grammarConcepts: number;
  savedTexts: number;
};

export type HomeDiscoveryPick = {
  label: string;
  href: string;
  kind: "concept" | "expression" | "text";
};

export type HomeCollectionLink = {
  label: string;
  href: string;
};

const MOTION_VERBS = [
  "идти",
  "ходить",
  "ехать",
  "ездить",
  "лететь",
  "летать",
  "бежать",
  "бегать",
  "плыть",
  "плавать",
  "нести",
  "носить",
  "везти",
  "возить",
  "писать",
  "написать",
];

export async function getHomeWorkspaceStats(textCount: number): Promise<HomeWorkspaceStats> {
  const [knownWords, grammarConcepts] = await Promise.all([
    prisma.knowledgeLemma.count({ where: LEARNABLE_LEMMA_WHERE }),
    prisma.knowledgeConcept.count({
      where: {
        category: { in: ["GRAMMAR_PATTERN", "CONSTRUCTION", "PREPOSITION_PATTERN"] },
      },
    }),
  ]);

  return {
    knownWords,
    grammarConcepts,
    savedTexts: textCount,
  };
}

export async function getHomeCollections(): Promise<HomeCollectionLink[]> {
  return [
    { label: "Library", href: "/library" },
    { label: "Grammar Atlas", href: "/explorer/concepts" },
    { label: "Vocabulary Atlas", href: "/explorer/lemmas" },
    { label: "Expressions", href: "/explorer/expressions" },
    { label: "Texts", href: "/library" },
    { label: "Favorites", href: "/library" },
  ];
}

export async function getHomeDiscovery(): Promise<HomeDiscoveryPick[]> {
  const dayBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

  const [concepts, expressions, texts] = await Promise.all([
    prisma.knowledgeConcept.findMany({
      orderBy: { hitCount: "desc" },
      take: 24,
      select: { title: true, conceptKey: true },
    }),
    prisma.knowledgePhrase.findMany({
      where: { type: { not: "COLLOCATION" } },
      orderBy: { occurrenceCount: "desc" },
      take: 24,
      select: { label: true },
    }),
    prisma.text.findMany({
      orderBy: { createdAt: "desc" },
      take: 24,
      select: { id: true, title: true },
    }),
  ]);

  const picks: HomeDiscoveryPick[] = [];

  if (concepts.length > 0) {
    const concept = concepts[dayBucket % concepts.length]!;
    picks.push({
      kind: "concept",
      label: concept.title,
      href: conceptPath(concept.conceptKey),
    });
  }

  if (expressions.length > 0) {
    const expression = expressions[(dayBucket + 3) % expressions.length]!;
    picks.push({
      kind: "expression",
      label: expression.label,
      href: expressionPath(expression.label),
    });
  }

  if (texts.length > 0) {
    const text = texts[(dayBucket + 7) % texts.length]!;
    picks.push({
      kind: "text",
      label: text.title,
      href: textPath(text.id),
    });
  }

  return picks;
}

export async function getRecentConceptEntries(): Promise<HomeConceptEntry[]> {
  return prisma.knowledgeConcept.findMany({
    orderBy: { hitCount: "desc" },
    take: 8,
    select: { title: true, conceptKey: true },
  });
}

export async function getAtlasTopics(): Promise<HomeAtlasTopic[]> {
  return [
    { label: "Grammar", href: "/explorer/concepts" },
    { label: "Vocabulary", href: "/explorer/lemmas" },
    { label: "Pronunciation", href: "/explorer?q=accent" },
    { label: "Culture", href: "/explorer/concepts" },
    { label: "Expressions", href: "/explorer/expressions" },
    { label: "Texts", href: "/library" },
  ];
}

function buildInsightText(
  lemma: string,
  hasAspectPartner: boolean,
  isMotionVerb: boolean,
  note: string | null,
): string {
  if (note && note.length <= 180) {
    return note;
  }

  if (isMotionVerb) {
    return "Russian motion verbs distinguish single movement from repeated movement.";
  }

  if (hasAspectPartner) {
    return "Russian aspect pairs distinguish a single action from its repeated or completed form.";
  }

  return `The word ${lemma} opens a chain of related forms and meanings worth following.`;
}

export async function getTodaysInsight(): Promise<HomeTodaysInsight | null> {
  const motionCandidates = await prisma.knowledgeLemma.findMany({
    where: {
      lemma: { in: MOTION_VERBS },
      occurrenceCount: { gt: 0 },
      ...LEARNABLE_LEMMA_WHERE,
    },
    orderBy: { occurrenceCount: "desc" },
  });

  const verbPool =
    motionCandidates.length > 0
      ? motionCandidates
      : await prisma.knowledgeLemma.findMany({
          where: { partOfSpeech: "verb", occurrenceCount: { gt: 0 }, ...LEARNABLE_LEMMA_WHERE },
          orderBy: { occurrenceCount: "desc" },
          take: 40,
        });

  if (verbPool.length === 0) {
    return null;
  }

  const dayBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const picked = verbPool[dayBucket % verbPool.length]!;
  const graph = await getLemmaGraph(picked.lemma, picked.partOfSpeech);

  if (!graph) {
    return null;
  }

  const chain: KnowledgeChainItem[] = [
    {
      label: graph.lemma.lemma,
      href: lemmaPath(graph.lemma.lemma, graph.lemma.partOfSpeech),
    },
  ];

  if (graph.aspectPartner) {
    chain.push({
      label: graph.aspectPartner.lemma,
      href: lemmaPath(graph.aspectPartner.lemma, graph.aspectPartner.partOfSpeech),
    });
  }

  for (const member of graph.familyLemmas) {
    if (member.lemma === graph.lemma.lemma) {
      continue;
    }
    chain.push({
      label: member.lemma,
      href: lemmaPath(member.lemma, member.partOfSpeech),
    });
    if (chain.length >= 6) {
      break;
    }
  }

  for (const phrase of graph.phrases) {
    chain.push({
      label: phrase.label,
      href:
        phrase.type === "COLLOCATION"
          ? collocationPath(phrase.label)
          : expressionPath(phrase.label),
    });
    if (chain.length >= 8) {
      break;
    }
  }

  const occurrence = graph.occurrences.find((item) => item.textId && item.textTitle);
  const relatedText = occurrence
    ? {
        label: occurrence.textTitle!,
        href: textPath(occurrence.textId!),
      }
    : null;

  if (relatedText) {
    chain.push(relatedText);
  }

  const primaryConcept = graph.concepts[0] ?? graph.relatedConcepts[0];
  const openHref = primaryConcept
    ? conceptPath(primaryConcept.conceptKey)
    : lemmaPath(graph.lemma.lemma, graph.lemma.partOfSpeech);

  const note =
    graph.lemma.frenchComparison?.trim() || graph.lemma.canonicalExplanation?.trim() || null;
  const isMotionVerb = MOTION_VERBS.includes(graph.lemma.lemma);

  return {
    insight: buildInsightText(
      graph.lemma.lemma,
      Boolean(graph.aspectPartner),
      isMotionVerb,
      note,
    ),
    chain: chain.slice(0, 10),
    openHref,
    openLabel: "Explore concept",
    relatedText,
  };
}

/** @deprecated Use getTodaysInsight */
export async function getDailyConnection(): Promise<{
  chain: KnowledgeChainItem[];
  relatedText: { label: string; href: string } | null;
  note: string | null;
} | null> {
  const insight = await getTodaysInsight();
  if (!insight) {
    return null;
  }

  return {
    chain: insight.chain,
    relatedText: insight.relatedText,
    note: insight.insight.length <= 160 ? insight.insight : null,
  };
}

/** @deprecated Use getAtlasTopics */
export type HomeExploreTopic = {
  label: string;
  href: string;
  count: number;
  unit: string;
};

/** @deprecated Use HomeTodaysInsight */
export type HomeDailyConnection = {
  chain: KnowledgeChainItem[];
  relatedText: { label: string; href: string } | null;
  note: string | null;
};

/** @deprecated Use getAtlasTopics */
export async function getExploreTopics(): Promise<HomeExploreTopic[]> {
  const [
    grammarCount,
    lemmaCount,
    pronunciationCount,
    cultureCount,
    expressionCount,
    textCount,
  ] = await Promise.all([
    prisma.knowledgeConcept.count({
      where: {
        category: { in: ["GRAMMAR_PATTERN", "CONSTRUCTION", "PREPOSITION_PATTERN"] },
      },
    }),
    prisma.knowledgeLemma.count({ where: LEARNABLE_LEMMA_WHERE }),
    prisma.knowledgeConcept.count({
      where: {
        OR: [
          { title: { contains: "accent" } },
          { title: { contains: "stress" } },
          { conceptKey: { contains: "stress" } },
          { conceptKey: { contains: "accent" } },
        ],
      },
    }),
    prisma.knowledgeConcept.count({ where: { category: "SEMANTIC" } }),
    prisma.knowledgePhrase.count({ where: { type: { not: "COLLOCATION" } } }),
    prisma.text.count(),
  ]);

  return [
    {
      label: "Grammar",
      href: "/explorer/concepts",
      count: grammarCount,
      unit: grammarCount === 1 ? "concept" : "concepts",
    },
    {
      label: "Vocabulary",
      href: "/explorer/lemmas",
      count: lemmaCount,
      unit: lemmaCount === 1 ? "lemme" : "lemmes",
    },
    {
      label: "Pronunciation",
      href: "/explorer?q=accent",
      count: pronunciationCount,
      unit: pronunciationCount === 1 ? "concept" : "concepts",
    },
    {
      label: "Culture",
      href: "/explorer/concepts",
      count: cultureCount,
      unit: cultureCount === 1 ? "concept" : "concepts",
    },
    {
      label: "Expressions",
      href: "/explorer/expressions",
      count: expressionCount,
      unit: expressionCount === 1 ? "expression" : "expressions",
    },
    {
      label: "Texts",
      href: "/library",
      count: textCount,
      unit: textCount === 1 ? "texte" : "textes",
    },
  ].filter((topic) => topic.count > 0);
}
