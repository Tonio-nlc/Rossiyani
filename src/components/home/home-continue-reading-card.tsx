"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getCollectionName } from "@/content/collections";
import { estimateReadingMinutes } from "@/components/library/library-utils";
import type { TextListItem } from "@/features/texts";
import { isDisplayableLibraryText } from "@/lib/home/displayable-text";
import { continueReadingRationale } from "@/lib/home/session-rationale";
import {
  formatLastReadLabel,
  getMostRecentReadingTextId,
  getTextReadingProgress,
} from "@/lib/reader/reading-progress";

import { HomeSessionCard } from "./home-session-card";

type HomeContinueReadingCardProps = {
  texts: TextListItem[];
};

export function HomeContinueReadingCard({ texts }: HomeContinueReadingCardProps) {
  const text = useMemo(() => {
    const displayable = texts.filter(isDisplayableLibraryText);
    if (displayable.length === 0) {
      return null;
    }
    if (typeof window === "undefined") {
      return displayable[0];
    }
    const recentId = getMostRecentReadingTextId();
    return displayable.find((item) => item.id === recentId) ?? displayable[0];
  }, [texts]);

  const [rationale, setRationale] = useState<string | null>(null);
  const [meta, setMeta] = useState<string | null>(null);

  useEffect(() => {
    if (!text) {
      return;
    }

    const progress = getTextReadingProgress(text.id);
    const minutes = estimateReadingMinutes(text.sentenceCount);

    if (!progress || progress.wordsSeenIds.length === 0) {
      setRationale(continueReadingRationale(text.title, null, null));
      setMeta(`${text.level} · ${minutes} min · Pas encore commencé`);
      return;
    }

    const lastRead = formatLastReadLabel(progress.lastReadAt);
    setRationale(continueReadingRationale(text.title, lastRead, progress.percent));
    setMeta(
      `${progress.percent} % · ${text.level} · Dernière ouverture ${lastRead.toLowerCase()}`,
    );
  }, [text]);

  if (!text) {
    return (
      <HomeSessionCard
        label="Reprendre la lecture"
        rationale="Ajoutez un texte à votre bibliothèque pour commencer une session."
      >
        <p className="text-sm text-[var(--ink-muted)]">Aucun texte disponible pour l&apos;instant.</p>
        <Link
          href="/import"
          className="focus-kb mt-3 inline-block text-sm text-[var(--ink-secondary)] hover:text-[var(--ink)]"
        >
          Importer un texte →
        </Link>
      </HomeSessionCard>
    );
  }

  const collectionName = getCollectionName(text.collectionId);
  const displayRationale =
    rationale ?? continueReadingRationale(text.title, null, null);

  return (
    <HomeSessionCard
      label="Reprendre la lecture"
      rationale={displayRationale}
      href={`/texts/${text.id}`}
      cta="Reprendre la lecture →"
      primary
    >
      <h2 className="font-reader text-[clamp(1.25rem,2.5vw,1.5rem)] leading-snug text-[var(--ink)]">
        {text.title}
      </h2>
      {collectionName ? (
        <p className="mt-1 line-clamp-1 text-sm text-[var(--ink-secondary)]">{collectionName}</p>
      ) : null}
      {meta ? <p className="mt-2 text-metadata text-[var(--ink-muted)]">{meta}</p> : null}
    </HomeSessionCard>
  );
}
