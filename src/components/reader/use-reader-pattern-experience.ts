"use client";

import { useCallback, useMemo, useState } from "react";

import type { ReaderTextData } from "@/features/texts";
import {
  getPatternEncounter,
  recordPatternExposure,
  recordPatternExplore,
} from "@/lib/reader/pattern-encounter-store";
import { getTextReadingProgress } from "@/lib/reader/reading-progress";
import {
  buildOrchestratorInputFromReader,
  decidePedagogicalIntervention,
  mapDecisionToPatternEcho,
  mapDecisionToReaderExperience,
} from "@/services/learning-orchestrator";
import {
  getOrchestratorSession,
  recordOrchestratorOutcome,
} from "@/services/learning-orchestrator/session-store";
import { isTokenInPatternInstance } from "@/services/learning-orchestrator/encounter-signals";
import type { ReaderPatternExperienceView } from "@/types/reader-pattern-experience";

function isFirstReadOfText(textId: string): boolean {
  const progress = getTextReadingProgress(textId);
  if (!progress) {
    return true;
  }
  return progress.sentencesSeenIds.length <= 1 && progress.percent < 5;
}

export function useReaderPatternExperience(text: ReaderTextData) {
  const [revision, setRevision] = useState(0);

  const bump = useCallback(() => {
    setRevision((value) => value + 1);
  }, []);

  const recordSentenceExposure = useCallback(
    (sentenceId: string) => {
      const context = text.patternSlice.bySentenceId[sentenceId];
      const patternId = context?.primaryPatternId;
      if (!patternId) {
        return;
      }

      recordPatternExposure({
        patternId,
        textId: text.id,
        textTitle: text.title,
        sentenceId,
      });
      bump();
    },
    [bump, text.id, text.patternSlice.bySentenceId, text.title],
  );

  const resolvePatternContext = useCallback(
    (sentenceId: string) => {
      const sentenceContext = text.patternSlice.bySentenceId[sentenceId];
      if (!sentenceContext?.primaryPatternId) {
        return null;
      }

      const pattern = text.patternSlice.patterns[sentenceContext.primaryPatternId] ?? null;
      return {
        pattern,
        context: sentenceContext,
        encounter: getPatternEncounter(sentenceContext.primaryPatternId),
      };
    },
    [text.patternSlice, revision],
  );

  const buildWordExperience = useCallback(
    (sentenceId: string, wordPosition: number): ReaderPatternExperienceView => {
      const resolved = resolvePatternContext(sentenceId);
      if (!resolved?.pattern || !resolved.context.instance) {
        return mapDecisionToReaderExperience(
          decidePedagogicalIntervention(
            buildOrchestratorInputFromReader({
              text,
              sentenceId,
              interaction: "explore_word",
              wordPosition,
              encounter: null,
              session: getOrchestratorSession(),
            }),
          ),
          null,
        );
      }

      const triggering = isTokenInPatternInstance(wordPosition, resolved.context.instance);
      const session = getOrchestratorSession();
      const decision = decidePedagogicalIntervention(
        buildOrchestratorInputFromReader({
          text,
          sentenceId,
          interaction: "explore_word",
          wordPosition,
          encounter: resolved.encounter,
          session,
          isFirstReadOfText: isFirstReadOfText(text.id),
        }),
      );

      const sentence = text.sentences.find((item) => item.id === sentenceId);
      const word = sentence?.words.find((item) => item.position === wordPosition);
      const anchorText = word?.stressMarked || word?.original || null;

      const view = mapDecisionToReaderExperience(decision, resolved.pattern, anchorText);

      if (triggering) {
        recordPatternExplore(resolved.pattern.id);
        if (view.visible && decision.action !== "SILENCE") {
          recordOrchestratorOutcome(decision, resolved.pattern.id);
        }
        bump();
      }

      return view;
    },
    [bump, resolvePatternContext, text],
  );

  const patternEchoBySentence = useMemo(() => {
    const map = new Map<string, boolean>();
    const session = getOrchestratorSession();

    for (const sentence of text.sentences) {
      const context = text.patternSlice.bySentenceId[sentence.id];
      if (!context?.primaryPatternId) {
        map.set(sentence.id, false);
        continue;
      }

      const encounter = getPatternEncounter(context.primaryPatternId);
      const decision = decidePedagogicalIntervention(
        buildOrchestratorInputFromReader({
          text,
          sentenceId: sentence.id,
          interaction: "reading",
          encounter,
          session,
        }),
      );
      map.set(sentence.id, mapDecisionToPatternEcho(decision));
    }

    return map;
  }, [text, revision]);

  return {
    recordSentenceExposure,
    buildWordExperience,
    patternEchoBySentence,
  };
}
