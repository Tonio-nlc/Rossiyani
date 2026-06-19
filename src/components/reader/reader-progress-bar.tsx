"use client";

import { ProgressBar } from "@/components/design-system";

type ReaderProgressBarProps = {
  percent: number;
  wordsSeenCount: number;
  totalWords: number;
  remainingMinutes: number | null;
};

export function ReaderProgressBar({
  percent,
  wordsSeenCount,
  totalWords,
  remainingMinutes,
}: ReaderProgressBarProps) {
  return (
    <div className="w-full min-w-[12rem] max-w-md space-y-1">
      <div className="flex items-center justify-between gap-3 text-[10px] text-[var(--muted)]">
        <span className="font-medium tabular-nums text-[var(--foreground)]">{percent} %</span>
        <span className="tabular-nums">
          {wordsSeenCount} / {totalWords} mots vus
        </span>
        {remainingMinutes !== null ? (
          <span className="tabular-nums">≈ {remainingMinutes} min restantes</span>
        ) : null}
      </div>
      <ProgressBar value={percent} className="h-1.5" />
    </div>
  );
}
