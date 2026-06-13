import type { FeaturedCandidate } from "@prisma/client";

import {
  collocationPath,
  conceptPath,
  expressionPath,
  lemmaPath,
} from "@/components/explorer/explorer-routes";
import { practicePath } from "@/lib/practice/constants";
import { prisma } from "@/lib/prisma";

import { getDateKey } from "./discovery-seed";
import { getLearnerContext } from "./get-learner-context";
import { parseJsonStringArray } from "./parse-json-array";
import { pickTypeForSeed, scoreCandidate } from "./score-candidate";
import { discoverySeed, hashString, seededIndex } from "./discovery-seed";
import type { FeaturedCandidateRow, TodaysDiscovery } from "./types";
import {
  DISCOVERY_TYPE_LABELS,
  DISCOVERY_TYPE_WEIGHTS,
  MIN_QUALITY_SCORE,
} from "./types";

function toRow(candidate: FeaturedCandidate): FeaturedCandidateRow {
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

function defaultExplorerHref(candidate: FeaturedCandidateRow): string {
  if (candidate.explorerHref) {
    return candidate.explorerHref;
  }

  switch (candidate.type) {
    case "WORD":
      return lemmaPath(candidate.lemma, candidate.partOfSpeech ?? "noun");
    case "COLLOCATION":
      return collocationPath(candidate.lemma);
    case "GRAMMAR":
      return conceptPath(candidate.lemma);
    case "EXPRESSION":
    case "CONSTRUCTION":
    case "CONVERSATION":
    case "NATIVE_PHRASE":
    case "SLANG":
    case "REGIONAL":
      return expressionPath(candidate.lemma);
    default:
      return `/explorer?q=${encodeURIComponent(candidate.lemma)}`;
  }
}

function defaultPracticeHref(candidate: FeaturedCandidateRow): string {
  if (candidate.practiceHref) {
    return candidate.practiceHref;
  }

  return practicePath({
    structure: candidate.lemma,
    mode: "structure",
    from: "explorer",
    context: candidate.subtitle ?? undefined,
  });
}

function defaultReadExamplesHref(candidate: FeaturedCandidateRow): string {
  if (candidate.readExamplesHref) {
    return candidate.readExamplesHref;
  }

  return `/explorer?q=${encodeURIComponent(candidate.lemma)}`;
}

function toDiscoveryView(
  candidate: FeaturedCandidateRow,
  dateKey: string,
): TodaysDiscovery {
  const topics = parseJsonStringArray(candidate.topics);

  return {
    id: candidate.id,
    type: candidate.type,
    typeLabel: DISCOVERY_TYPE_LABELS[candidate.type],
    displayLabel: candidate.lemma,
    subtitle: candidate.subtitle ?? "—",
    explanation:
      candidate.explanation ??
      "A useful pattern worth exploring in authentic Russian today.",
    exampleRussian: candidate.exampleRussian ?? candidate.lemma,
    exampleTranslation: candidate.exampleTranslation ?? candidate.subtitle ?? "—",
    difficulty: candidate.difficulty,
    register: candidate.register,
    topics,
    explorerHref: defaultExplorerHref(candidate),
    practiceHref: defaultPracticeHref(candidate),
    readExamplesHref: defaultReadExamplesHref(candidate),
    partOfSpeech: candidate.partOfSpeech,
    dateKey,
  };
}

function selectCandidate(
  pool: FeaturedCandidateRow[],
  learnerId: string,
  dateKey: string,
  signals: Parameters<typeof scoreCandidate>[1],
): FeaturedCandidateRow | null {
  if (pool.length === 0) {
    return null;
  }

  const seed = discoverySeed(learnerId, dateKey);
  const availableTypes = [...new Set(pool.map((candidate) => candidate.type))];
  const preferredType = pickTypeForSeed(seed, availableTypes, DISCOVERY_TYPE_WEIGHTS);

  const typedPool = preferredType
    ? pool.filter((candidate) => candidate.type === preferredType)
    : pool;
  const scoringPool = typedPool.length > 0 ? typedPool : pool;

  const scored = scoringPool.map((candidate) => ({
    candidate,
    score: scoreCandidate(candidate, signals),
  }));

  scored.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return (
      hashString(`${learnerId}:${dateKey}:${right.candidate.id}`) -
      hashString(`${learnerId}:${dateKey}:${left.candidate.id}`)
    );
  });

  const topScore = scored[0]?.score ?? 0;
  const tieBand = scored
    .filter((entry) => entry.score >= topScore - 0.01)
    .map((entry) => entry.candidate);

  return tieBand[seededIndex(seed, tieBand.length)] ?? scored[0]?.candidate ?? null;
}

async function loadCandidateById(id: string): Promise<FeaturedCandidateRow | null> {
  const candidate = await prisma.featuredCandidate.findUnique({ where: { id } });
  return candidate ? toRow(candidate) : null;
}

async function loadCandidatePool(): Promise<FeaturedCandidateRow[]> {
  const candidates = await prisma.featuredCandidate.findMany({
    where: {
      validated: true,
      qualityScore: { gte: MIN_QUALITY_SCORE },
    },
    orderBy: [{ qualityScore: "desc" }, { frequency: "desc" }],
  });

  return candidates.map(toRow);
}

export async function getTodaysDiscovery(): Promise<TodaysDiscovery | null> {
  const dateKey = getDateKey();
  const { learnerId, signals, cachedDiscovery } = await getLearnerContext(dateKey);
  const effectiveLearnerId = learnerId ?? "anonymous";

  if (cachedDiscovery) {
    const cached = await loadCandidateById(cachedDiscovery.candidateId);
    if (cached) {
      return toDiscoveryView(cached, dateKey);
    }
  }

  const pool = await loadCandidatePool();
  if (pool.length === 0) {
    return null;
  }

  const selected = selectCandidate(pool, effectiveLearnerId, dateKey, signals);

  if (!selected) {
    return null;
  }

  if (!cachedDiscovery) {
    await prisma.featuredCandidate.update({
      where: { id: selected.id },
      data: { lastFeatured: new Date() },
    });
  }

  return toDiscoveryView(selected, dateKey);
}
