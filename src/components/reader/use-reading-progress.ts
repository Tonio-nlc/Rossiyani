"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  computeSentencePercent,
  estimateRemainingMinutes,
  estimateReadingMinutes,
  getTextReadingProgress,
  upsertReadingProgress,
  type TextReadingProgress,
} from "@/lib/reader/reading-progress";
import type { ReaderTextData } from "@/features/texts";

const TICK_MS = 15_000;

export function useReadingProgress(text: ReaderTextData) {
  const totalWords = useMemo(
    () => text.sentences.reduce((sum, sentence) => sum + sentence.words.length, 0),
    [text],
  );
  const totalSentences = text.sentences.length;

  const [progress, setProgress] = useState<TextReadingProgress | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const accumulatedRef = useRef<number>(0);

  useEffect(() => {
    setProgress(getTextReadingProgress(text.id));
  }, [text.id]);

  const flushReadingTime = useCallback(() => {
    const now = Date.now();
    const delta = now - lastTickRef.current;
    if (delta <= 0) {
      return;
    }
    lastTickRef.current = now;
    accumulatedRef.current += delta;

    if (accumulatedRef.current < 1000) {
      return;
    }

    const batch = accumulatedRef.current;
    accumulatedRef.current = 0;

    setProgress((current) => {
      const base = current ?? getTextReadingProgress(text.id);
      const next = upsertReadingProgress({
        textId: text.id,
        lastSentenceId: base?.lastSentenceId ?? text.sentences[0]?.id ?? "",
        lastWordId: base?.lastWordId ?? null,
        totalWords,
        readingTimeDeltaMs: batch,
      });
      return next;
    });
  }, [text.id, text.sentences, totalWords]);

  useEffect(() => {
    lastTickRef.current = Date.now();
    const timer = window.setInterval(flushReadingTime, TICK_MS);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        flushReadingTime();
      } else {
        lastTickRef.current = Date.now();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      flushReadingTime();
    };
  }, [flushReadingTime]);

  const recordSentence = useCallback(
    (sentenceId: string) => {
      flushReadingTime();
      const next = upsertReadingProgress({
        textId: text.id,
        lastSentenceId: sentenceId,
        seenSentenceId: sentenceId,
        totalWords,
      });
      setProgress(next);
    },
    [flushReadingTime, text.id, totalWords],
  );

  const recordWord = useCallback(
    (wordId: string, sentenceId: string) => {
      flushReadingTime();
      const next = upsertReadingProgress({
        textId: text.id,
        lastSentenceId: sentenceId,
        lastWordId: wordId,
        seenWordId: wordId,
        seenSentenceId: sentenceId,
        totalWords,
      });
      setProgress(next);
    },
    [flushReadingTime, text.id, totalWords],
  );

  const sentencesSeenCount = progress?.sentencesSeenIds?.length ?? 0;
  const remainingMinutes = estimateRemainingMinutes(progress, totalWords);
  const estimatedMinutes = estimateReadingMinutes(totalWords);
  const sentencePercent = computeSentencePercent(sentencesSeenCount, totalSentences);

  return {
    progress,
    totalWords,
    totalSentences,
    wordsSeenCount: progress?.wordsSeenIds.length ?? 0,
    sentencesSeenCount,
    percent: progress?.percent ?? 0,
    sentencePercent,
    estimatedMinutes,
    remainingMinutes,
    recordSentence,
    recordWord,
  };
}
