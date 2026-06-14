import { phraseLookupKey, toRussianLookupKey } from "@/lib/normalization/russian-key";
import { findClosestKnownForm } from "@/services/import-quality/levenshtein";
import { loadCuratedJsonCandidates } from "@/features/discovery/load-candidate-pool";
import type { FeaturedCandidateRow } from "@/features/discovery/types";

export function findCuratedCandidateExact(label: string): FeaturedCandidateRow | null {
  const key = phraseLookupKey(label);
  return (
    loadCuratedJsonCandidates().find(
      (candidate) => phraseLookupKey(candidate.lemma) === key,
    ) ?? null
  );
}

export function findCuratedCandidateFuzzy(label: string): FeaturedCandidateRow | null {
  const exact = findCuratedCandidateExact(label);
  if (exact) {
    return exact;
  }

  const key = phraseLookupKey(label);
  const candidates = loadCuratedJsonCandidates();
  const keys = candidates.map((candidate) => phraseLookupKey(candidate.lemma));
  const closestKey = findClosestKnownForm(key, keys, 3);
  if (!closestKey) {
    return null;
  }

  return (
    candidates.find((candidate) => phraseLookupKey(candidate.lemma) === closestKey) ?? null
  );
}

export function searchCuratedCandidates(query: string, limit = 6): FeaturedCandidateRow[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const key = phraseLookupKey(trimmed);
  const scored = loadCuratedJsonCandidates()
    .map((candidate) => {
      const candidateKey = phraseLookupKey(candidate.lemma);
      let score = 0;
      if (candidateKey === key) {
        score = 100;
      } else if (candidateKey.includes(key) || key.includes(candidateKey)) {
        score = 70;
      } else if (candidate.lemma.toLowerCase().includes(trimmed.toLowerCase())) {
        score = 50;
      } else {
        const distance = findClosestKnownForm(key, [candidateKey], 2);
        score = distance ? 40 : 0;
      }
      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.candidate.manualPriority - a.candidate.manualPriority ||
        b.candidate.qualityScore - a.candidate.qualityScore,
    );

  return scored.slice(0, limit).map((entry) => entry.candidate);
}

export function findCuratedByRelation(relation: string): FeaturedCandidateRow | null {
  const key = toRussianLookupKey(relation);
  return (
    loadCuratedJsonCandidates().find(
      (candidate) =>
        phraseLookupKey(candidate.lemma) === key ||
        (Array.isArray(candidate.relations) &&
          candidate.relations.some(
            (item) => typeof item === "string" && toRussianLookupKey(item) === key,
          )),
    ) ?? null
  );
}

export function getPopularCuratedConstructions(count = 4): FeaturedCandidateRow[] {
  return loadCuratedJsonCandidates()
    .filter((candidate) => ["CONSTRUCTION", "COLLOCATION"].includes(candidate.type))
    .sort(
      (a, b) =>
        b.manualPriority - a.manualPriority ||
        b.qualityScore - a.qualityScore ||
        b.frequency - a.frequency,
    )
    .slice(0, count);
}
