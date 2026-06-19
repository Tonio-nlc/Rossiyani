"use client";

import { useEffect, useState } from "react";

import {
  formatLastReadLabel,
  getTextReadingProgress,
  renderProgressBlocks,
} from "@/lib/reader/reading-progress";

type LibraryCardProgressProps = {
  textId: string;
};

export function LibraryCardProgress({ textId }: LibraryCardProgressProps) {
  const [progress, setProgress] = useState(() => getTextReadingProgress(textId));

  useEffect(() => {
    setProgress(getTextReadingProgress(textId));
  }, [textId]);

  if (!progress || progress.wordsSeenIds.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-1.5 border border-[var(--hairline)] bg-[var(--surface-primary)] px-3 py-2.5">
      <p className="font-mono text-xs tabular-nums text-[var(--color-primary)]">
        {renderProgressBlocks(progress.percent)} {progress.percent} %
      </p>
      <p className="text-xs text-[var(--muted)]">
        {progress.wordsSeenIds.length} / {progress.totalWords} mots vus
      </p>
      <p className="text-[10px] text-[var(--muted)]">
        Dernière lecture : {formatLastReadLabel(progress.lastReadAt)}
      </p>
    </div>
  );
}
