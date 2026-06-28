import type { LearningPattern } from "@/types/patterns";
import type { ExplanationDepth } from "@/types/patterns";

import type { DetectionCandidate, DetectionContext } from "./detectors/types";
import { detectConceptMapping, DETECTION_RULE_HANDLERS } from "./detectors/rule-handlers";

export type MergedDetectionCandidate = DetectionCandidate & {
  salience: number;
};

function mergeEvidence(
  left: DetectionCandidate["evidence"],
  right: DetectionCandidate["evidence"],
): DetectionCandidate["evidence"] {
  const seen = new Set<string>();
  const merged: DetectionCandidate["evidence"] = [];

  for (const entry of [...left, ...right]) {
    const key = `${entry.source}:${entry.rule ?? ""}:${entry.conceptKey ?? ""}:${entry.message}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    merged.push(entry);
  }

  return merged;
}

function mergeSpans(
  left: DetectionCandidate["span"],
  right: DetectionCandidate["span"],
): DetectionCandidate["span"] {
  return {
    startPosition: Math.min(left.startPosition, right.startPosition),
    endPosition: Math.max(left.endPosition, right.endPosition),
  };
}

function mergeCandidates(existing: MergedDetectionCandidate, incoming: DetectionCandidate): MergedDetectionCandidate {
  const detectionScore = Math.min(1, existing.detectionScore + incoming.detectionScore * 0.5);
  const confidence = Math.min(1, Math.max(existing.confidence, incoming.confidence));

  return {
    patternId: existing.patternId,
    span: mergeSpans(existing.span, incoming.span),
    confidence,
    detectionScore,
    evidence: mergeEvidence(existing.evidence, incoming.evidence),
    triggeringTokens: [...new Set([...existing.triggeringTokens, ...incoming.triggeringTokens])].sort(
      (a, b) => a - b,
    ),
    salience: Math.min(1, (existing.salience + confidence) / 2 + detectionScore * 0.15),
  };
}

function runRuleHandlers(context: DetectionContext): DetectionCandidate[] {
  const hits: DetectionCandidate[] = [];

  for (const rule of context.pattern.detectionRules) {
    const handler = DETECTION_RULE_HANDLERS[rule.rule];
    if (!handler) {
      continue;
    }

    const candidate = handler(context);
    if (candidate) {
      hits.push({
        ...candidate,
        detectionScore: Math.min(1, candidate.detectionScore * rule.weight + rule.weight * 0.1),
      });
    }
  }

  const conceptHit = detectConceptMapping(context);
  if (conceptHit) {
    hits.push(conceptHit);
  }

  return hits;
}

export function detectPatternsInSentence(
  patterns: LearningPattern[],
  context: Omit<DetectionContext, "pattern">,
): MergedDetectionCandidate[] {
  const byPatternId = new Map<string, MergedDetectionCandidate>();

  for (const pattern of patterns) {
    if (pattern.status === "deprecated") {
      continue;
    }

    const patternContext: DetectionContext = { ...context, pattern };
    const hits = runRuleHandlers(patternContext);

    for (const hit of hits) {
      const salience = Math.min(1, hit.confidence * 0.6 + hit.detectionScore * 0.4);
      const merged: MergedDetectionCandidate = { ...hit, salience };
      const existing = byPatternId.get(hit.patternId);

      if (existing) {
        byPatternId.set(hit.patternId, mergeCandidates(existing, hit));
      } else {
        byPatternId.set(hit.patternId, merged);
      }
    }
  }

  return [...byPatternId.values()].sort((a, b) => b.salience - a.salience);
}

export function defaultIntroductionLevel(pattern: LearningPattern): ExplanationDepth {
  if (pattern.difficulty <= 2) {
    return "L2";
  }
  if (pattern.difficulty === 3) {
    return "L2";
  }
  return "L3";
}
