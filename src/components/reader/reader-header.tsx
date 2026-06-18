"use client";

import { MetadataLine } from "@/components/editorial";
import { ProgressBar } from "@/components/ui/progress-bar";

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
    `${sentenceCount} ${sentenceCount === 1 ? "sentence" : "sentences"}`,
  ];

  const sentenceLabel =
    sentenceCount > 0
      ? `Sentence ${Math.min(currentSentenceIndex + 1, sentenceCount)} / ${sentenceCount}`
      : null;

  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h1 className="font-reader text-[clamp(1.75rem,4vw,2.25rem)] font-semibold leading-tight tracking-tight text-[var(--ink)]">
            {title}
          </h1>
          <p className="text-sm text-[var(--ink-secondary)]">{collectionName}</p>
          <MetadataLine items={metaItems} />
        </div>
        <button
          type="button"
          onClick={() => onFocusModeChange(!focusMode)}
          className="focus-kb shrink-0 text-xs text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline"
        >
          {focusMode ? "Exit focus" : "Focus"}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <ProgressBar value={percent} className="h-px flex-1" aria-label="Reading progress" />
        {sentenceLabel ? (
          <p className="shrink-0 text-[10px] tracking-wide text-[var(--ink-muted)]">
            {sentenceLabel}
          </p>
        ) : null}
      </div>
    </header>
  );
}
