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
    <header className="editorial-page-section space-y-4 pb-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h1 className="editorial-lead-title font-semibold leading-tight tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-[var(--ink-secondary)]">{collectionName}</p>
          <MetadataLine items={metaItems} />
        </div>
        <GhostButton onClick={() => onFocusModeChange(!focusMode)}>
          {focusMode ? "Quitter le focus" : "Mode focus"}
        </GhostButton>
      </div>

      <div className="flex items-center gap-4">
        <ProgressBar value={percent} className="flex-1" aria-label="Progression de lecture" />
        {sentenceLabel ? (
          <p className="shrink-0 text-[10px] tracking-wide text-[var(--ink-muted)]">{sentenceLabel}</p>
        ) : null}
      </div>
    </header>
  );
}
