import { prisma } from "@/lib/prisma";
import { getConceptGraph } from "@/services/knowledge-graph/get-concept-graph";
import type { KnowledgeChainItem } from "@/components/editorial";
import {
  collocationPath,
  conceptPath,
  expressionPath,
  lemmaPath,
} from "@/components/explorer/explorer-routes";

export type ExplorerIndexTopic = {
  label: string;
  href: string;
  count: number;
  unit: string;
};

export type KnowledgeCanvasData = {
  focalLabel: string;
  focalHref: string;
  chain: KnowledgeChainItem[];
  note: string | null;
};

export async function getExplorerIndex(textCount: number): Promise<ExplorerIndexTopic[]> {
  const [
    grammarCount,
    lemmaCount,
    pronunciationCount,
    morphologyCount,
    cultureCount,
    expressionCount,
    collocationCount,
  ] = await Promise.all([
    prisma.knowledgeConcept.count({
      where: {
        category: { in: ["GRAMMAR_PATTERN", "CONSTRUCTION", "PREPOSITION_PATTERN"] },
      },
    }),
    prisma.knowledgeLemma.count(),
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
    prisma.knowledgeEnding.count(),
    prisma.knowledgeConcept.count({ where: { category: "SEMANTIC" } }),
    prisma.knowledgePhrase.count({ where: { type: { not: "COLLOCATION" } } }),
    prisma.knowledgePhrase.count({ where: { type: "COLLOCATION" } }),
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
      label: "Morphology",
      href: "/explorer/endings",
      count: morphologyCount,
      unit: morphologyCount === 1 ? "terminaison" : "terminaisons",
    },
    {
      label: "Culture",
      href: "/explorer/concepts",
      count: cultureCount,
      unit: cultureCount === 1 ? "concept" : "concepts",
    },
    {
      label: "Texts",
      href: "/library",
      count: textCount,
      unit: textCount === 1 ? "texte" : "textes",
    },
    {
      label: "Expressions",
      href: "/explorer/expressions",
      count: expressionCount,
      unit: expressionCount === 1 ? "expression" : "expressions",
    },
    {
      label: "Collocations",
      href: "/explorer/collocations",
      count: collocationCount,
      unit: collocationCount === 1 ? "collocation" : "collocations",
    },
  ].filter((topic) => topic.count > 0);
}

export async function getKnowledgeCanvas(): Promise<KnowledgeCanvasData | null> {
  const concepts = await prisma.knowledgeConcept.findMany({
    orderBy: { hitCount: "desc" },
    take: 40,
    select: { conceptKey: true, title: true, canonicalExplanation: true },
  });

  if (concepts.length === 0) {
    return null;
  }

  const dayBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const picked = concepts[dayBucket % concepts.length]!;
  const graph = await getConceptGraph(picked.conceptKey);

  if (!graph) {
    return null;
  }

  const chain: KnowledgeChainItem[] = [
    {
      label: graph.concept.title,
      href: conceptPath(graph.concept.conceptKey),
    },
  ];

  for (const related of graph.relatedConcepts.slice(0, 5)) {
    chain.push({
      label: related.title,
      href: conceptPath(related.conceptKey),
    });
  }

  for (const lemma of graph.lemmas.slice(0, 3)) {
    chain.push({
      label: lemma.lemma,
      href: lemmaPath(lemma.lemma, lemma.partOfSpeech),
    });
  }

  for (const phrase of graph.phrases.slice(0, 2)) {
    chain.push({
      label: phrase.label,
      href:
        phrase.type === "COLLOCATION"
          ? collocationPath(phrase.label)
          : expressionPath(phrase.label),
    });
  }

  const note = graph.concept.canonicalExplanation?.trim() || null;

  return {
    focalLabel: graph.concept.title,
    focalHref: conceptPath(graph.concept.conceptKey),
    chain: chain.slice(0, 10),
    note: note && note.length <= 200 ? note : null,
  };
}
