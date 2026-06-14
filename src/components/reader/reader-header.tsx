"use client";

import { MetadataLine } from "@/components/editorial";
import { ProgressBar } from "@/components/ui/progress-bar";

type ReaderHeaderProps = {
  title: string;
  level: string;
  estimatedMinutes: number;
  sentenceCount: number;
  wordCount: number;
  percent: number;
  focusMode: boolean;
  onFocusModeChange: (enabled: boolean) => void;
};

export function ReaderHeader({
  title,
  level,
  estimatedMinutes,
  sentenceCount,
  wordCount,
  percent,
  focusMode,
  onFocusModeChange,
}: ReaderHeaderProps) {
  const metaItems = [
    level,
    `${estimatedMinutes} min`,
    `${sentenceCount} ${sentenceCount === 1 ? "sentence" : "sentences"}`,
    `${wordCount} ${wordCount === 1 ? "word" : "words"}`,
  ];

  return (
    <header className="max-w-[var(--reading-max)] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <h1 className="font-reader text-[clamp(1.75rem,4vw,2.25rem)] font-semibold leading-tight tracking-tight text-[var(--ink)]">
            {title}
          </h1>
          <MetadataLine items={metaItems} />
        </div>
        <div className="flex shrink-0 rounded-full border border-[var(--hairline)] p-0.5 text-xs">
          <button
            type="button"
            onClick={() => onFocusModeChange(false)}
            className={[
              "focus-kb rounded-full px-3 py-1.5 font-medium transition",
              !focusMode
                ? "bg-[var(--ink)] text-[var(--surface)]"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
            ].join(" ")}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => onFocusModeChange(true)}
            className={[
              "focus-kb rounded-full px-3 py-1.5 font-medium transition",
              focusMode
                ? "bg-[var(--ink)] text-[var(--surface)]"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
            ].join(" ")}
          >
            Focus
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs text-[var(--ink-muted)]">
          <span className="font-medium tabular-nums text-[var(--ink)]">{percent}%</span>
          <span className="font-mono text-[10px] tracking-wider">
            {renderBlockProgress(percent)}
          </span>
        </div>
        <ProgressBar value={percent} className="h-1.5" />
      </div>
    </header>
  );
}

function renderBlockProgress(percent: number, blocks = 12): string {
  const filled = Math.round((percent / 100) * blocks);
  return `${"█".repeat(filled)}${"░".repeat(blocks - filled)}`;
}
