import type { FeaturedCandidateRow, LearningSignals } from "./types";

const DAY_MS = 1000 * 60 * 60 * 24;

function parseDateKey(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year!, month! - 1, day!).getTime();
}

function daysSinceLastDiscovery(
  candidateId: string,
  signals: LearningSignals,
  now: number,
): number | null {
  const dates = signals.discoveryArchive
    .filter((entry) => entry.candidateId === candidateId)
    .map((entry) => parseDateKey(entry.dateKey));

  if (dates.length === 0) {
    return null;
  }

  const lastSeen = Math.max(...dates);
  return (now - lastSeen) / DAY_MS;
}

/**
 * Freshness tiers for daily discovery — prevents repetitive picks.
 * @see design pre-launch roadmap Phase 2
 */
export function freshnessScore(
  candidate: FeaturedCandidateRow,
  signals: LearningSignals,
  now = Date.now(),
): number {
  const daysSince = daysSinceLastDiscovery(candidate.id, signals, now);

  if (daysSince === null) {
    if (signals.featuredHistory.includes(candidate.id)) {
      return 20;
    }
    return 100;
  }

  if (daysSince <= 7) {
    return -100;
  }

  if (daysSince >= 180) {
    return 60;
  }

  if (daysSince >= 90) {
    return 40;
  }

  if (daysSince >= 30) {
    return 20;
  }

  return 0;
}

export function freshnessScoreFromLastFeatured(
  candidate: FeaturedCandidateRow,
  now = Date.now(),
): number {
  if (!candidate.lastFeatured) {
    return 100;
  }

  const daysSince = (now - candidate.lastFeatured.getTime()) / DAY_MS;

  if (daysSince <= 7) {
    return -100;
  }

  if (daysSince >= 180) {
    return 60;
  }

  if (daysSince >= 90) {
    return 40;
  }

  if (daysSince >= 30) {
    return 20;
  }

  return 0;
}
