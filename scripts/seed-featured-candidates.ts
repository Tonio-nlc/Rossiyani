#!/usr/bin/env tsx
/**
 * Populate featured_candidates from validated JSON + knowledge graph staging pool.
 *
 * Usage:
 *   tsx scripts/seed-featured-candidates.ts [--reset]
 *   tsx scripts/seed-featured-candidates.ts --from-graph   # import graph candidates (validated=false)
 *
 * Editorial workflow: add entries to content/discoveries/*.json, then re-run this script.
 * Target pool: ~1,600 validated discoveries (see pre-launch roadmap Phase 2).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  CefrLevel,
  FeaturedCandidateType,
  PartOfSpeech,
  PhraseGroupType,
  Register,
} from "@prisma/client";

import {
  collocationPath,
  conceptPath,
  expressionPath,
  lemmaPath,
} from "../src/components/explorer/explorer-routes";
import { practicePath } from "../src/lib/practice/constants";
import { prisma } from "../src/lib/prisma";

type CuratedCandidate = {
  type: FeaturedCandidateType;
  lemma: string;
  subtitle: string;
  explanation: string;
  exampleRussian: string;
  exampleTranslation: string;
  frequency: number;
  register: Register;
  difficulty: CefrLevel;
  topics: string[];
  relations: string[];
  qualityScore: number;
  manualPriority: number;
  partOfSpeech?: PartOfSpeech;
  explorerHref?: string;
};

const DISCOVERIES_DIR = join(process.cwd(), "content/discoveries");

function loadValidatedJson(): CuratedCandidate[] {
  const files = readdirSync(DISCOVERIES_DIR).filter((file) => file.endsWith(".json"));
  const entries: CuratedCandidate[] = [];

  for (const file of files) {
    const raw = readFileSync(join(DISCOVERIES_DIR, file), "utf8");
    const parsed = JSON.parse(raw) as CuratedCandidate[];
    if (Array.isArray(parsed)) {
      entries.push(...parsed);
    }
  }

  return entries;
}

function defaultExplorerHref(entry: CuratedCandidate): string {
  if (entry.explorerHref) {
    return entry.explorerHref;
  }

  switch (entry.type) {
    case "WORD":
      return lemmaPath(entry.lemma, entry.partOfSpeech ?? "noun");
    case "COLLOCATION":
      return collocationPath(entry.lemma);
    case "GRAMMAR":
      return conceptPath(entry.lemma);
    default:
      return expressionPath(entry.lemma);
  }
}

function frequencyTierToDifficulty(tier: string | null | undefined): CefrLevel {
  switch (tier) {
    case "TOP_500":
      return "A2";
    case "TOP_1000":
      return "B1";
    case "TOP_3000":
      return "B2";
    default:
      return "B1";
  }
}

function phraseTypeToCandidateType(type: PhraseGroupType): FeaturedCandidateType {
  switch (type) {
    case "COLLOCATION":
      return "COLLOCATION";
    case "NATIVE_CONSTRUCTION":
      return "CONSTRUCTION";
    default:
      return "EXPRESSION";
  }
}

function qualityFromOccurrences(count: number): number {
  return Math.min(95, Math.max(45, 50 + Math.log10(count + 1) * 12));
}

async function upsertValidated(entry: CuratedCandidate): Promise<void> {
  const explorerHref = defaultExplorerHref(entry);
  const existing = await prisma.featuredCandidate.findFirst({
    where: { lemma: entry.lemma, type: entry.type },
  });

  const data = {
    type: entry.type,
    lemma: entry.lemma,
    subtitle: entry.subtitle,
    explanation: entry.explanation,
    exampleRussian: entry.exampleRussian,
    exampleTranslation: entry.exampleTranslation,
    frequency: entry.frequency,
    register: entry.register,
    difficulty: entry.difficulty,
    topics: entry.topics,
    relations: entry.relations,
    qualityScore: entry.qualityScore,
    manualPriority: entry.manualPriority,
    validated: true,
    partOfSpeech: entry.partOfSpeech ?? null,
    explorerHref,
    practiceHref: practicePath({
      structure: entry.lemma,
      mode: "structure",
      from: "explorer",
      context: entry.subtitle,
    }),
    readExamplesHref: explorerHref,
  };

  if (existing) {
    await prisma.featuredCandidate.update({ where: { id: existing.id }, data });
    return;
  }

  await prisma.featuredCandidate.create({ data });
}

async function seedFromLemmas(limit = 500, validated = false): Promise<number> {
  const lemmas = await prisma.knowledgeLemma.findMany({
    where: { occurrenceCount: { gt: 2 } },
    orderBy: { occurrenceCount: "desc" },
    take: limit,
    include: {
      occurrences: {
        take: 1,
        where: { naturalTranslation: { not: null } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  let count = 0;

  for (const lemma of lemmas) {
    const duplicate = await prisma.featuredCandidate.findFirst({
      where: { lemma: lemma.lemma, type: "WORD" },
    });
    if (duplicate) {
      continue;
    }

    const occurrence = lemma.occurrences[0];
    if (!occurrence?.sentenceRussian || !occurrence.naturalTranslation) {
      continue;
    }

    await prisma.featuredCandidate.create({
      data: {
        type: "WORD",
        lemma: lemma.stressMarked || lemma.lemma,
        subtitle: lemma.frenchComparison?.split(/[,;]/)[0]?.trim() ?? null,
        explanation: lemma.canonicalExplanation?.slice(0, 220) ?? null,
        exampleRussian: occurrence.sentenceRussian,
        exampleTranslation: occurrence.naturalTranslation,
        frequency: lemma.occurrenceCount,
        register: "neutral",
        difficulty: frequencyTierToDifficulty(lemma.frequencyTier ?? undefined),
        topics: [],
        relations: [lemma.lemma],
        qualityScore: qualityFromOccurrences(lemma.occurrenceCount),
        manualPriority: 0,
        validated,
        partOfSpeech: lemma.partOfSpeech,
        explorerHref: lemmaPath(lemma.lemma, lemma.partOfSpeech),
        practiceHref: practicePath({
          structure: lemma.lemma,
          mode: "structure",
          from: "explorer",
        }),
        readExamplesHref: lemmaPath(lemma.lemma, lemma.partOfSpeech),
      },
    });
    count += 1;
  }

  return count;
}

async function seedFromPhrases(limit = 300, validated = false): Promise<number> {
  const phrases = await prisma.knowledgePhrase.findMany({
    where: { occurrenceCount: { gt: 1 } },
    orderBy: { occurrenceCount: "desc" },
    take: limit,
    include: {
      phraseOccurrences: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  let count = 0;

  for (const phrase of phrases) {
    const type = phraseTypeToCandidateType(phrase.type);
    const duplicate = await prisma.featuredCandidate.findFirst({
      where: { lemma: phrase.label, type },
    });
    if (duplicate) {
      continue;
    }

    const occurrence = phrase.phraseOccurrences[0];
    if (!occurrence?.sentenceRussian) {
      continue;
    }

    const href =
      type === "COLLOCATION"
        ? collocationPath(phrase.label)
        : expressionPath(phrase.label);

    await prisma.featuredCandidate.create({
      data: {
        type,
        lemma: phrase.label,
        subtitle: phrase.explanation.slice(0, 80),
        explanation: phrase.canonicalExplanation ?? phrase.explanation,
        exampleRussian: occurrence.sentenceRussian,
        exampleTranslation: occurrence.naturalTranslation ?? null,
        frequency: phrase.occurrenceCount,
        register: "neutral",
        difficulty: "B1",
        topics: [],
        relations: [],
        qualityScore: qualityFromOccurrences(phrase.occurrenceCount),
        manualPriority: 0,
        validated,
        explorerHref: href,
        practiceHref: practicePath({
          structure: phrase.label,
          mode: "structure",
          from: "explorer",
        }),
        readExamplesHref: href,
      },
    });
    count += 1;
  }

  return count;
}

async function seedFromConcepts(limit = 100, validated = false): Promise<number> {
  const concepts = await prisma.knowledgeConcept.findMany({
    where: { hitCount: { gt: 0 } },
    orderBy: { hitCount: "desc" },
    take: limit,
  });

  let count = 0;

  for (const concept of concepts) {
    const duplicate = await prisma.featuredCandidate.findFirst({
      where: { lemma: concept.title, type: "GRAMMAR" },
    });
    if (duplicate) {
      continue;
    }

    await prisma.featuredCandidate.create({
      data: {
        type: "GRAMMAR",
        lemma: concept.title,
        subtitle: concept.category.replace(/_/g, " ").toLowerCase(),
        explanation: concept.canonicalExplanation.slice(0, 240),
        exampleRussian: concept.title,
        exampleTranslation: concept.frenchComparison?.slice(0, 120) ?? concept.title,
        frequency: concept.hitCount,
        register: "neutral",
        difficulty: "B2",
        topics: ["grammar"],
        relations: [concept.conceptKey],
        qualityScore: qualityFromOccurrences(concept.hitCount),
        manualPriority: 0,
        validated,
        explorerHref: conceptPath(concept.conceptKey),
        practiceHref: practicePath({
          structure: concept.title,
          mode: "structure",
          from: "explorer",
        }),
        readExamplesHref: conceptPath(concept.conceptKey),
      },
    });
    count += 1;
  }

  return count;
}

async function main() {
  const reset = process.argv.includes("--reset");
  const fromGraph = process.argv.includes("--from-graph");

  if (reset) {
    const deleted = await prisma.featuredCandidate.deleteMany();
    console.log(`Removed ${deleted.count} existing candidates.`);
  }

  const validatedEntries = loadValidatedJson();
  for (const entry of validatedEntries) {
    await upsertValidated(entry);
  }
  console.log(`Upserted ${validatedEntries.length} validated JSON candidates.`);

  let fromLemmas = 0;
  let fromPhrases = 0;
  let fromConcepts = 0;

  if (fromGraph) {
    [fromLemmas, fromPhrases, fromConcepts] = await Promise.all([
      seedFromLemmas(500, false),
      seedFromPhrases(300, false),
      seedFromConcepts(100, false),
    ]);
    console.log(`Imported graph staging pool: ${fromLemmas} words, ${fromPhrases} phrases, ${fromConcepts} concepts.`);
  }

  const [total, validatedCount, stagingCount] = await Promise.all([
    prisma.featuredCandidate.count(),
    prisma.featuredCandidate.count({ where: { validated: true } }),
    prisma.featuredCandidate.count({ where: { validated: false } }),
  ]);

  console.log(
    JSON.stringify(
      {
        validatedJson: validatedEntries.length,
        fromLemmas,
        fromPhrases,
        fromConcepts,
        total,
        validatedCount,
        stagingCount,
        targetValidated: 1600,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
