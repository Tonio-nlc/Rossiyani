"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { estimateReadingMinutes } from "@/components/library/library-utils";
import type { TextListItem } from "@/features/texts";
import { displayableTextSource, isDisplayableLibraryText } from "@/lib/home/displayable-text";
import {
  getMostRecentReadingTextId,
  getTextReadingProgress,
} from "@/lib/reader/reading-progress";

type HomeContinueReadingProps = {
  texts: TextListItem[];
};

export function HomeContinueReading({ texts }: HomeContinueReadingProps) {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  const candidate = useMemo(() => {
    const displayable = texts.filter(isDisplayableLibraryText);
    if (displayable.length === 0) {
      return null;
    }

    const recentId = getMostRecentReadingTextId();
    const recent = recentId ? displayable.find((item) => item.id === recentId) : null;
    return recent ?? null;
  }, [texts]);

  useEffect(() => {
    if (!candidate) {
      setReady(true);
      setVisible(false);
      return;
    }

    const progress = getTextReadingProgress(candidate.id);
    const hasHistory = Boolean(progress && progress.wordsSeenIds.length > 0);
    setVisible(hasHistory);
    setReady(true);
  }, [candidate]);

  if (!ready || !visible || !candidate) {
    return null;
  }

  const progress = getTextReadingProgress(candidate.id);
  const minutes = estimateReadingMinutes(candidate.sentenceCount);
  const author = displayableTextSource(candidate.source);
  const percent = progress?.percent ?? 0;

  return (
    <section>
      <p className="home-section-label">Continue reading</p>

      <Link
        href={`/texts/${candidate.id}`}
        prefetch
        className="focus-kb group mt-6 block max-w-2xl"
      >
        <h2 className="font-reader text-[clamp(1.5rem,3vw,2rem)] leading-tight tracking-tight text-[var(--ink)] transition group-hover:text-[var(--color-link)]">
          {candidate.title}
        </h2>

        {author ? (
          <p className="mt-2 text-sm text-[var(--ink-secondary)]">{author}</p>
        ) : null}

        <p className="mt-4 text-sm text-[var(--ink-muted)]">
          {candidate.level} · {minutes} min read
          {percent > 0 ? ` · ${percent}% complete` : null}
        </p>

        <p className="mt-6 text-sm font-medium text-[var(--ink)] transition group-hover:text-[var(--color-link)]">
          Continue reading →
        </p>
      </Link>
    </section>
  );
}
