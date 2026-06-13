"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { estimateReadingMinutes } from "@/components/library/library-utils";
import type { TextListItem } from "@/features/texts";
import {
  formatLastReadLabel,
  getMostRecentReadingTextId,
  getTextReadingProgress,
} from "@/lib/reader/reading-progress";

type HomeContinueReadingCardProps = {
  texts: TextListItem[];
};

export function HomeContinueReadingCard({ texts }: HomeContinueReadingCardProps) {
  const text = useMemo(() => {
    if (texts.length === 0) {
      return null;
    }
    if (typeof window === "undefined") {
      return texts[0];
    }
    const recentId = getMostRecentReadingTextId();
    return texts.find((item) => item.id === recentId) ?? texts[0];
  }, [texts]);

  const [meta, setMeta] = useState<string | null>(null);

  useEffect(() => {
    if (!text) {
      return;
    }

    const progress = getTextReadingProgress(text.id);
    const minutes = estimateReadingMinutes(text.sentenceCount);

    if (!progress || progress.wordsSeenIds.length === 0) {
      setMeta(`${text.level} · ${minutes} min · Not started`);
      return;
    }

    setMeta(
      `${progress.percent}% · ${text.level} · Last opened ${formatLastReadLabel(progress.lastReadAt).toLowerCase()}`,
    );
  }, [text]);

  if (!text) {
    return (
      <div className="border border-[var(--hairline)] px-4 py-4">
        <p className="home-section-label">Continue reading</p>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">No text in your library yet.</p>
        <Link href="/import" className="focus-kb mt-2 inline-block text-sm text-[var(--ink-secondary)]">
          Import a text →
        </Link>
      </div>
    );
  }

  const subtitle = text.source ?? "Author unknown";

  return (
    <Link
      href={`/texts/${text.id}`}
      prefetch
      className="focus-kb group block border border-[var(--hairline)] px-4 py-4 transition hover:border-[var(--hairline-strong)]"
    >
      <p className="home-section-label">Continue reading</p>
      <h3 className="mt-2 font-reader text-lg leading-snug text-[var(--ink)] group-hover:text-[var(--color-link)]">
        {text.title}
      </h3>
      <p className="mt-1 line-clamp-1 text-sm text-[var(--ink-secondary)]">{subtitle}</p>
      {meta ? <p className="mt-2 text-metadata text-[var(--ink-muted)]">{meta}</p> : null}
      <p className="mt-2 text-sm text-[var(--ink-secondary)] group-hover:text-[var(--color-link)]">
        Continue reading →
      </p>
    </Link>
  );
}
