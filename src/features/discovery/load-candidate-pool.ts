import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  CefrLevel,
  FeaturedCandidateType,
  PartOfSpeech,
  Register,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type { FeaturedCandidateRow } from "./types";
import { MIN_QUALITY_SCORE } from "./types";

type CuratedCandidateJson = {
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
  practiceHref?: string;
  readExamplesHref?: string;
};

const DISCOVERIES_DIR = join(process.cwd(), "content/discoveries");

export function curatedCandidateId(type: FeaturedCandidateType, lemma: string): string {
  return `curated:${type}:${lemma}`;
}

export function isCuratedCandidateId(id: string): boolean {
  return id.startsWith("curated:");
}

function jsonToRow(entry: CuratedCandidateJson): FeaturedCandidateRow {
  return {
    id: curatedCandidateId(entry.type, entry.lemma),
    type: entry.type,
    lemma: entry.lemma,
    frequency: entry.frequency,
    register: entry.register,
    difficulty: entry.difficulty,
    topics: entry.topics,
    relations: entry.relations,
    qualityScore: entry.qualityScore,
    lastFeatured: null,
    manualPriority: entry.manualPriority,
    subtitle: entry.subtitle,
    explanation: entry.explanation,
    exampleRussian: entry.exampleRussian,
    exampleTranslation: entry.exampleTranslation,
    explorerHref: entry.explorerHref ?? null,
    practiceHref: entry.practiceHref ?? null,
    readExamplesHref: entry.readExamplesHref ?? null,
    partOfSpeech: entry.partOfSpeech ?? null,
  };
}

let cachedCuratedJson: FeaturedCandidateRow[] | null = null;

export function loadCuratedJsonCandidates(): FeaturedCandidateRow[] {
  if (cachedCuratedJson) {
    return cachedCuratedJson;
  }

  try {
    const files = readdirSync(DISCOVERIES_DIR).filter((file) => file.endsWith(".json"));
    const entries: FeaturedCandidateRow[] = [];

    for (const file of files) {
      const raw = readFileSync(join(DISCOVERIES_DIR, file), "utf8");
      const parsed = JSON.parse(raw) as CuratedCandidateJson[];
      if (Array.isArray(parsed)) {
        entries.push(...parsed.map(jsonToRow));
      }
    }

    cachedCuratedJson = entries;
    return entries;
  } catch {
    return [];
  }
}

function findCuratedCandidateById(id: string): FeaturedCandidateRow | null {
  return loadCuratedJsonCandidates().find((candidate) => candidate.id === id) ?? null;
}

async function loadDatabaseCandidates(): Promise<FeaturedCandidateRow[]> {
  const toRow = (candidate: Awaited<ReturnType<typeof prisma.featuredCandidate.findMany>>[number]) =>
    ({
      id: candidate.id,
      type: candidate.type,
      lemma: candidate.lemma,
      frequency: candidate.frequency,
      register: candidate.register,
      difficulty: candidate.difficulty,
      topics: candidate.topics,
      relations: candidate.relations,
      qualityScore: candidate.qualityScore,
      lastFeatured: candidate.lastFeatured,
      manualPriority: candidate.manualPriority,
      subtitle: candidate.subtitle,
      explanation: candidate.explanation,
      exampleRussian: candidate.exampleRussian,
      exampleTranslation: candidate.exampleTranslation,
      explorerHref: candidate.explorerHref,
      practiceHref: candidate.practiceHref,
      readExamplesHref: candidate.readExamplesHref,
      partOfSpeech: candidate.partOfSpeech,
    }) satisfies FeaturedCandidateRow;

  const strict = await prisma.featuredCandidate.findMany({
    where: {
      validated: true,
      qualityScore: { gte: MIN_QUALITY_SCORE },
    },
    orderBy: [{ manualPriority: "desc" }, { qualityScore: "desc" }, { frequency: "desc" }],
  });

  if (strict.length > 0) {
    return strict.map(toRow);
  }

  const validated = await prisma.featuredCandidate.findMany({
    where: { validated: true },
    orderBy: [{ manualPriority: "desc" }, { qualityScore: "desc" }, { frequency: "desc" }],
  });

  return validated.map(toRow);
}

/** Validated DB pool first; falls back to editorial JSON when the table is empty. */
export async function loadCandidatePool(): Promise<FeaturedCandidateRow[]> {
  const database = await loadDatabaseCandidates();
  if (database.length > 0) {
    return database;
  }

  return loadCuratedJsonCandidates();
}

export async function loadCandidateById(id: string): Promise<FeaturedCandidateRow | null> {
  if (isCuratedCandidateId(id)) {
    return findCuratedCandidateById(id);
  }

  const candidate = await prisma.featuredCandidate.findUnique({ where: { id } });
  if (candidate) {
    return {
      id: candidate.id,
      type: candidate.type,
      lemma: candidate.lemma,
      frequency: candidate.frequency,
      register: candidate.register,
      difficulty: candidate.difficulty,
      topics: candidate.topics,
      relations: candidate.relations,
      qualityScore: candidate.qualityScore,
      lastFeatured: candidate.lastFeatured,
      manualPriority: candidate.manualPriority,
      subtitle: candidate.subtitle,
      explanation: candidate.explanation,
      exampleRussian: candidate.exampleRussian,
      exampleTranslation: candidate.exampleTranslation,
      explorerHref: candidate.explorerHref,
      practiceHref: candidate.practiceHref,
      readExamplesHref: candidate.readExamplesHref,
      partOfSpeech: candidate.partOfSpeech,
    };
  }

  return findCuratedCandidateById(id);
}

/** Test helper — clears in-memory JSON cache. */
export function clearCuratedCandidateCache(): void {
  cachedCuratedJson = null;
}
