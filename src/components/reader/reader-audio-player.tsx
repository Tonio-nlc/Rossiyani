"use client";

import { useCallback, useMemo } from "react";

import { useAudioPlayback } from "@/components/audio/audio-playback-provider";

export type ReaderAudioPlayerProps = {
  sentenceIds: string[];
  startSentenceId: string | null;
  onSentenceSeek?: (sentenceId: string) => void;
};

export function ReaderAudioPlayer({
  sentenceIds,
  startSentenceId,
  onSentenceSeek,
}: ReaderAudioPlayerProps) {
  const {
    state,
    speed,
    textSession,
    cycleSpeed,
    playText,
    pause,
    resume,
    stop,
    seekSentenceIndex,
  } = useAudioPlayback();

  const sentenceCount = sentenceIds.length;
  const currentIndex = textSession?.currentIndex ?? 0;
  const progress =
    sentenceCount > 1 ? (currentIndex / (sentenceCount - 1)) * 100 : sentenceCount === 1 ? 0 : 0;

  const isActive = state === "playing" || state === "paused" || state === "loading";
  const playing = state === "playing" || state === "loading";

  const startIndex = useMemo(() => {
    if (!startSentenceId) {
      return 0;
    }
    const index = sentenceIds.indexOf(startSentenceId);
    return index >= 0 ? index : 0;
  }, [sentenceIds, startSentenceId]);

  const handlePlayPause = useCallback(() => {
    if (state === "playing") {
      pause();
      return;
    }
    if (state === "paused") {
      resume();
      return;
    }
    if (sentenceIds.length === 0) {
      return;
    }
    void playText(sentenceIds, textSession?.currentIndex ?? startIndex);
  }, [pause, playText, resume, sentenceIds, startIndex, state, textSession?.currentIndex]);

  const handleSeek = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (sentenceCount <= 1) {
        return;
      }
      const value = Number(event.target.value);
      const index = Math.round((value / 100) * (sentenceCount - 1));
      seekSentenceIndex(index);
      const sentenceId = sentenceIds[index];
      if (sentenceId) {
        onSentenceSeek?.(sentenceId);
      }
    },
    [onSentenceSeek, seekSentenceIndex, sentenceCount, sentenceIds],
  );

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  if (sentenceCount === 0) {
    return null;
  }

  return (
    <div className="reader-ws-player" aria-label="Lecteur audio">
      <div className="reader-ws-player__inner">
        <button
          type="button"
          className="reader-ws-player__play focus-kb"
          onClick={handlePlayPause}
          aria-label={playing ? "Pause" : "Lecture"}
        >
          {playing ? (
            <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-player__play-icon">
              <path d="M7 5.5v9M13 5.5v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-player__play-icon">
              <path d="M7.5 5.5 15 10l-7.5 4.5V5.5Z" fill="currentColor" />
            </svg>
          )}
        </button>

        <div className="reader-ws-player__track-wrap">
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={isActive ? progress : 0}
            onChange={handleSeek}
            className="reader-ws-player__range"
            aria-label="Progression dans le texte"
            disabled={sentenceCount <= 1}
          />
          <div className="reader-ws-player__times">
            <span>
              {currentIndex + 1} / {sentenceCount}
            </span>
          </div>
        </div>

        <button type="button" className="reader-ws-player__speed focus-kb" onClick={cycleSpeed}>
          {speed}x
        </button>

        {isActive ? (
          <button
            type="button"
            className="reader-ws-player__download focus-kb"
            onClick={handleStop}
            aria-label="Arrêter la lecture"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-player__download-icon">
              <rect x="6" y="6" width="8" height="8" rx="1" fill="currentColor" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
