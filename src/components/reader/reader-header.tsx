"use client";

import { MetadataLine } from "@/components/editorial";
import { GhostButton, ProgressBar } from "@/components/design-system";

type ReaderHeaderProps = {
  title: string;
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
    <header className="editorial-page-section space-y-2 pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-eyebrow">Lecture</p>
          <h1 className="font-reader text-lg font-medium leading-snug tracking-tight text-[var(--ink-secondary)]">
            {title}
          </h1>
          <p className="text-metadata">{collectionName}</p>
          <MetadataLine items={metaItems} className="text-metadata" />
        </div>
        <GhostButton onClick={() => onFocusModeChange(!focusMode)}>
          {focusMode ? "Quitter le focus" : "Focus →"}
        </GhostButton>
      </div>

      <div className="flex items-center gap-4">
        <ProgressBar value={percent} className="flex-1" aria-label="Progression de lecture" />
        {sentenceLabel ? (
          <p className="shrink-0 text-metadata">{sentenceLabel}</p>
        ) : null}
      </div>
    </header>
  );
}
