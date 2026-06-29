"use client";

import { useMemo } from "react";

import { getPatternEncounter } from "@/lib/reader/pattern-encounter-store";
import {
  decidePedagogicalIntervention,
  getOrchestratorSession,
  mapDecisionToVocabularyExperience,
} from "@/services/learning-orchestrator";
import type { ReaderPatternExperienceView } from "@/types/reader-pattern-experience";
import type { VocabularyPatternRef } from "@/types/vocabulary-pattern-experience";

function buildOrchestratorInputForPattern(
  pattern: VocabularyPatternRef,
  sourceTextId: string,
  sourceTextTitle: string | null,
) {
  const encounter = getPatternEncounter(pattern.id);
  const session = getOrchestratorSession();

  return {
    interaction: "explore_vocabulary" as const,
    sentence: {
      sentenceId: pattern.encounteredExamples[0]?.sentenceId ?? `vocab:${pattern.id}`,
      textId: pattern.encounteredExamples[0]?.textId ?? sourceTextId,
      textTitle: pattern.encounteredExamples[0]?.textTitle ?? sourceTextTitle ?? "Vocabulary",
    },
    primaryPattern: {
      patternId: pattern.id,
      pattern: {
        id: pattern.id,
        userFacingName: pattern.userFacingName,
        observation: pattern.observation,
        insight: pattern.insight,
        comprehension: pattern.comprehension,
        guide: pattern.guide,
      },
      instance: {
        span: { startPosition: 0, endPosition: 0 },
        triggeringTokens: [],
        salience: 1,
        confidence: 1,
      },
    },
    secondaryPatternIds: pattern.relatedPatternIds,
    encounter,
    session,
  };
}

export function useVocabularyPatternExperience(
  patterns: VocabularyPatternRef[],
  sourceTextId: string,
  sourceTextTitle: string | null,
): Map<string, ReaderPatternExperienceView> {
  return useMemo(() => {
    const map = new Map<string, ReaderPatternExperienceView>();

    for (const pattern of patterns) {
      const decision = decidePedagogicalIntervention(
        buildOrchestratorInputForPattern(pattern, sourceTextId, sourceTextTitle),
      );
      map.set(
        pattern.id,
        mapDecisionToVocabularyExperience(decision, pattern, pattern.formalization),
      );
    }

    return map;
  }, [patterns, sourceTextId, sourceTextTitle]);
}
