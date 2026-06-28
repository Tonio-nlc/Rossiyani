import type { PatternCatalogService } from "@/services/patterns/pattern-catalog-service";
import type { LearningPattern, PatternFrequency } from "@/types/patterns";
import type { MergedDetectionCandidate } from "./detect-patterns";
import type { PrimarySelectionReason } from "@/types/pattern-instances";

export type PrimarySelectionContext = {
  textId: string;
  editorialIntroPatternIds?: string[];
};

const FREQUENCY_WEIGHT: Record<PatternFrequency, number> = {
  core: 30,
  frequent: 20,
  intermediate: 10,
  advanced: 5,
};

/**
 * Stable prioritization for import-time indexing (user-agnostic).
 *
 * Order of precedence (PATTERN_SYSTEM.md §4.3, adapted without mastery state):
 * 1. Editorial introduction for this text
 * 2. Aggregated detection score
 * 3. Pattern frequency (core > frequent > …)
 * 4. Locality — smaller span preferred
 * 5. Lower difficulty as tie-breaker
 */
export function selectPrimaryPattern(
  candidates: MergedDetectionCandidate[],
  catalog: PatternCatalogService,
  context: PrimarySelectionContext,
): {
  primary: MergedDetectionCandidate | null;
  reasons: PrimarySelectionReason[];
} {
  if (candidates.length === 0) {
    return { primary: null, reasons: [] };
  }

  if (candidates.length === 1) {
    return {
      primary: candidates[0]!,
      reasons: [
        {
          code: "sole_candidate",
          message: "Seul Learning Pattern détecté dans la phrase",
          weight: 1000,
        },
      ],
    };
  }

  const editorialIds = new Set(context.editorialIntroPatternIds ?? []);
  const scored = candidates.map((candidate) => {
    const pattern = catalog.getPattern(candidate.patternId);
    const reasons: PrimarySelectionReason[] = [];
    let score = candidate.detectionScore * 100;
    reasons.push({
      code: "detection_score",
      message: `Score de détection ${candidate.detectionScore.toFixed(2)}`,
      weight: score,
    });

    if (editorialIds.has(candidate.patternId)) {
      const bonus = 1000;
      score += bonus;
      reasons.push({
        code: "editorial_introduction",
        message: "LP marqué pour introduction dans ce texte",
        weight: bonus,
      });
    }

    if (pattern) {
      const frequencyBonus = FREQUENCY_WEIGHT[pattern.frequency];
      score += frequencyBonus;
      reasons.push({
        code: "pattern_frequency",
        message: `Fréquence catalogue : ${pattern.frequency}`,
        weight: frequencyBonus,
      });

      const spanLength = candidate.span.endPosition - candidate.span.startPosition + 1;
      const localityBonus = Math.max(0, 20 - spanLength);
      score += localityBonus;
      reasons.push({
        code: "locality",
        message: `Préférence pour un LP local (étendue ${spanLength} token(s))`,
        weight: localityBonus,
      });

      const levelBonus = levelRank(pattern.recommendedLevel);
      score += levelBonus;
      reasons.push({
        code: "recommended_level",
        message: `Niveau recommandé ${pattern.recommendedLevel}`,
        weight: levelBonus,
      });

      score -= pattern.difficulty;
    }

    return { candidate, score, reasons };
  });

  scored.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return left.candidate.patternId.localeCompare(right.candidate.patternId);
  });

  const winner = scored[0]!;
  return {
    primary: winner.candidate,
    reasons: winner.reasons,
  };
}

function levelRank(level: LearningPattern["recommendedLevel"]): number {
  const order = ["A1", "A2", "B1", "B2", "C1", "Native"];
  const index = order.indexOf(level);
  return index >= 0 ? Math.max(0, 10 - index) : 0;
}
