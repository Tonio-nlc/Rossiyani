"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ReaderAudioPlayerProps = {
  sentenceCount: number;
  currentSentenceIndex: number;
  onSentenceSeek?: (index: number) => void;
};

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ReaderAudioPlayer({
  sentenceCount,
  currentSentenceIndex,
  onSentenceSeek,
}: ReaderAudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  const duration = Math.max(sentenceCount * 8, 60);
  const currentTime = Math.min((currentSentenceIndex / Math.max(sentenceCount, 1)) * duration, duration);

  useEffect(() => {
    setProgress(sentenceCount > 0 ? (currentSentenceIndex / sentenceCount) * 100 : 0);
  }, [currentSentenceIndex, sentenceCount]);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setProgress((value) => Math.min(value + 0.4 * speed, 100));
    }, 200);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [playing, speed]);

  const handleSeek = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      setProgress(value);
      if (onSentenceSeek && sentenceCount > 0) {
        const index = Math.round((value / 100) * (sentenceCount - 1));
        onSentenceSeek(index);
      }
    },
    [onSentenceSeek, sentenceCount],
  );

  const cycleSpeed = () => {
    const index = SPEED_OPTIONS.indexOf(speed);
    setSpeed(SPEED_OPTIONS[(index + 1) % SPEED_OPTIONS.length]);
  };

  return (
    <div className="reader-ws-player" aria-label="Audio player">
      <div className="reader-ws-player__inner">
        <button
          type="button"
          className="reader-ws-player__play focus-kb"
          onClick={() => setPlaying((value) => !value)}
          aria-label={playing ? "Pause" : "Play"}
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
            value={progress}
            onChange={handleSeek}
            className="reader-ws-player__range"
            aria-label="Playback progress"
          />
          <div className="reader-ws-player__times">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button type="button" className="reader-ws-player__speed focus-kb" onClick={cycleSpeed}>
          {speed}x
        </button>

        <button type="button" className="reader-ws-player__download focus-kb" aria-label="Download audio">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-player__download-icon">
            <path d="M10 4.5v8m0 0 3-3m-3 3-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5 15.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
