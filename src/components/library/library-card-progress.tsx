"use client";

import { useEffect, useState } from "react";

import {
  formatLastReadLabel,
  getTextReadingProgress,
} from "@/lib/reader/reading-progress";

type LibraryCardProgressProps = {
  textId: string;
  compact?: boolean;
  workspace?: boolean;
};

export function LibraryCardProgress({
  textId,
  compact = false,
  workspace = false,
}: LibraryCardProgressProps) {
  const [progress, setProgress] = useState(() => getTextReadingProgress(textId));

  useEffect(() => {
    setProgress(getTextReadingProgress(textId));
  }, [textId]);

  if (!progress || progress.wordsSeenIds.length === 0) {
    return null;
  }

  if (workspace) {
    return (
      <div className="library-ws-text-card__progress">
        <span className="library-ws-text-card__progress-label">
          {progress.percent}% · {formatLastReadLabel(progress.lastReadAt)}
        </span>
        <div className="library-ws-text-card__progress-bar" aria-hidden>
          <div
            className="library-ws-text-card__progress-fill"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <p className="library-catalog-card-progress">
        {progress.percent} % &bull; {formatLastReadLabel(progress.lastReadAt)}
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-1.5 border border-[var(--hairline)] bg-[var(--surface-primary)] px-3 py-2.5">
      <p className="font-mono text-xs tabular-nums text-[var(--color-primary)]">
        {progress.percent} %
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
