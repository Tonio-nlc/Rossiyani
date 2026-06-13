import type { FeaturedCandidateType } from "@prisma/client";

import { freshnessScore } from "./freshness-score";
import { seededPercent } from "./discovery-seed";
import { parseJsonStringArray } from "./parse-json-array";
import type { FeaturedCandidateRow, LearningSignals } from "./types";

function normalizeFrequency(frequency: number): number {
  if (frequency <= 0) {
    return 0;
  }
  return Math.min(1, Math.log10(frequency + 1) / 3);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,;·]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function overlaps(a: string[], b: string[]): boolean {
  const set = new Set(a.map((item) => item.toLowerCase()));
  return b.some((item) => set.has(item.toLowerCase()));
}

function recentlyStudiedBonus(candidate: FeaturedCandidateRow, signals: LearningSignals): number {
  const label = candidate.lemma.toLowerCase();
  const relations = parseJsonStringArray(candidate.relations);

  if (signals.exploredLemmas.some((lemma) => lemma.toLowerCase() === label)) {
    return 1;
  }

  if (signals.exploredPhrases.some((phrase) => phrase.toLowerCase() === label)) {
    return 1;
  }

  if (overlaps(relations, signals.exploredLemmas)) {
    return 0.85;
  }

  if (overlaps(relations, signals.practiceStructures)) {
    return 0.75;
  }

  if (signals.readTextIds.length > 0 && relations.length > 0) {
    return 0.35;
  }

  return 0;
}

function themeAffinityBonus(candidate: FeaturedCandidateRow, signals: LearningSignals): number {
  const topics = parseJsonStringArray(candidate.topics);
  if (topics.length === 0 || signals.recentTopics.length === 0) {
    return 0;
  }
  return overlaps(topics, signals.recentTopics) ? 1 : 0;
}

function difficultyFitBonus(candidate: FeaturedCandidateRow, signals: LearningSignals): number {
  const activityCount =
    signals.exploredLemmas.length +
    signals.exploredPhrases.length +
    signals.readTextIds.length +
    signals.practiceStructures.length;

  if (activityCount === 0) {
    return candidate.difficulty === "A1" || candidate.difficulty === "A2" ? 0.8 : 0.5;
  }

  if (activityCount < 5) {
    return ["A1", "A2", "B1"].includes(candidate.difficulty) ? 0.9 : 0.4;
  }

  if (activityCount < 15) {
    return ["B1", "B2"].includes(candidate.difficulty) ? 0.9 : 0.55;
  }

  return ["B2", "C1", "Native"].includes(candidate.difficulty) ? 0.85 : 0.45;
}

function savedRelationsBonus(candidate: FeaturedCandidateRow, signals: LearningSignals): number {
  const relations = parseJsonStringArray(candidate.relations);
  const savedTokens = signals.savedPhraseTexts.flatMap(tokenize);

  if (savedTokens.length === 0) {
    return 0;
  }

  const lemmaTokens = tokenize(candidate.lemma);
  if (overlaps(lemmaTokens, savedTokens)) {
    return 1;
  }

  return overlaps(relations, savedTokens) ? 0.7 : 0;
}

function masteredPenalty(candidate: FeaturedCandidateRow, signals: LearningSignals): number {
  const label = candidate.lemma.toLowerCase();
  const visits =
    signals.exploredLemmas.filter((lemma) => lemma.toLowerCase() === label).length +
    signals.exploredPhrases.filter((phrase) => phrase.toLowerCase() === label).length;

  if (visits >= 3) {
    return 1;
  }

  if (visits >= 2) {
    return 0.6;
  }

  return 0;
}

export function scoreCandidate(
  candidate: FeaturedCandidateRow,
  signals: LearningSignals,
): number {
  let score = 0;

  score += freshnessScore(candidate, signals);
  score += normalizeFrequency(candidate.frequency) * 40;
  score += recentlyStudiedBonus(candidate, signals) * 30;
  score += themeAffinityBonus(candidate, signals) * 20;
  score += difficultyFitBonus(candidate, signals) * 20;
  score += savedRelationsBonus(candidate, signals) * 10;
  score -= masteredPenalty(candidate, signals) * 60;

  score += candidate.manualPriority * 8;
  score += candidate.qualityScore * 0.15;

  return score;
}

export function pickTypeForSeed(
  seed: number,
  availableTypes: FeaturedCandidateType[],
  weights: Array<{ type: FeaturedCandidateType; weight: number }>,
): FeaturedCandidateType | null {
  const allowed = new Set(availableTypes);
  const pool = weights.filter((entry) => allowed.has(entry.type));
  if (pool.length === 0) {
    return availableTypes[0] ?? null;
  }

  let cursor = seededPercent(seed);

  for (const entry of pool) {
    cursor -= entry.weight;
    if (cursor < 0) {
      return entry.type;
    }
  }

  return pool[pool.length - 1]!.type;
}
