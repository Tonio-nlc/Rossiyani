"use client";

import { MetadataLine } from "@/components/editorial";
import { ProgressBar } from "@/components/ui/progress-bar";

type ReaderHeaderProps = {
  title: string;
  level: string;
  estimatedMinutes: number;
  sentenceCount: number;
  percent: number;
  focusMode: boolean;
  onFocusModeChange: (enabled: boolean) => void;
};

export function ReaderHeader({
  title,
  level,
  estimatedMinutes,
  sentenceCount,
  percent,
  focusMode,
  onFocusModeChange,
}: ReaderHeaderProps) {
  const metaItems = [
    level,
    `${estimatedMinutes} min`,
    `${sentenceCount} ${sentenceCount === 1 ? "sentence" : "sentences"}`,
  ];

  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <h1 className="font-reader text-[clamp(1.75rem,4vw,2.25rem)] font-semibold leading-tight tracking-tight text-[var(--ink)]">
            {title}
          </h1>
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

      <ProgressBar value={percent} className="h-1" aria-label="Reading progress" />
    </header>
  );
}
