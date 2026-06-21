"use client";

import { MetadataLine } from "@/components/editorial";
import { ProgressBar } from "@/components/design-system";

type ReaderHeaderProps = {
  title: string;
  subtitle?: string | null;
  collectionName: string;
  level: string;
  estimatedMinutes: number;
  sentenceCount: number;
  currentSentenceIndex: number;
  percent: number;
  focusMode: boolean;
  onFocusModeChange: (enabled: boolean) => void;
};

export function ReaderHeader({
  title,
  subtitle,
  collectionName,
  level,
  estimatedMinutes,
  sentenceCount,
  currentSentenceIndex,
  percent,
  focusMode,
  onFocusModeChange,
}: ReaderHeaderProps) {
  const metaItems = [
    level,
    `${estimatedMinutes} min`,
    `${sentenceCount} ${sentenceCount === 1 ? "phrase" : "phrases"}`,
  ];

  const sentenceLabel =
    sentenceCount > 0
      ? `Phrase ${Math.min(currentSentenceIndex + 1, sentenceCount)} / ${sentenceCount}`
      : null;

  return (
    <header className="reader-header">
      <p className="reader-header__eyebrow">
        <span className="reader-header__collection">{collectionName}</span>
        <span className="reader-header__eyebrow-sep" aria-hidden>
          ·
        </span>
        <span className="reader-header__level">{level}</span>
      </p>

      <div className="reader-header__title-row">
        <h1 className="reader-header__title">{title}</h1>
        <button
          type="button"
          onClick={() => onFocusModeChange(!focusMode)}
          className={[
            "reader-header__focus focus-kb",
            focusMode ? "reader-header__focus--active" : "",
          ].join(" ")}
          aria-pressed={focusMode}
        >
          <span className="reader-header__focus-icon" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle
                cx="7"
                cy="7"
                r="5.5"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeDasharray={focusMode ? "0" : "2 2"}
              />
              <circle cx="7" cy="7" r="2" fill="currentColor" />
            </svg>
          </span>
          {focusMode ? "Quitter l'immersion" : "Lecture immersive"}
        </button>
      </div>

      {subtitle ? <p className="reader-header__subtitle">{subtitle}</p> : null}

      <MetadataLine items={metaItems} className="reader-header__meta" />

      <div className="reader-header__progress">
        <div className="reader-header__progress-track">
          <ProgressBar value={percent} aria-label="Progression de lecture" />
        </div>
        <div className="reader-header__progress-meta">
          <span className="reader-header__percent">{percent} %</span>
          {sentenceLabel ? (
            <span className="reader-header__sentence">{sentenceLabel}</span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
