"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getLocalDueCards, getLocalReviewStats } from "@/lib/review";
import type { ReviewStats } from "@/lib/review";
import { reviewTodayRationale } from "@/lib/home/session-rationale";

import { HomeSessionCard } from "./home-session-card";

export function HomeWorkspaceReview() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [previewLabels, setPreviewLabels] = useState<string[]>([]);

  useEffect(() => {
    const nextStats = getLocalReviewStats();
    const due = getLocalDueCards(5);
    setStats(nextStats);
    setPreviewLabels(due.map((card) => card.item.content.prompt));
  }, []);

  if (!stats) {
    return null;
  }

  const rationale = reviewTodayRationale(previewLabels[0] ?? undefined);
  const moreCount = Math.max(0, stats.dueToday - previewLabels.length);

  return (
    <HomeSessionCard label="Révision du jour" rationale={rationale}>
      {previewLabels.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {previewLabels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full border border-[var(--hairline)] px-3 py-1.5 font-reader text-sm text-[var(--ink)]"
            >
              {label}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--ink-muted)]">
          Aucune carte due — continuez à lire et enregistrez des mots.
        </p>
      )}

      {moreCount > 0 ? (
        <Link
          href="/review"
          className="focus-kb mt-3 inline-block text-sm text-[var(--ink-secondary)] hover:text-[var(--ink)]"
        >
          +{moreCount} de plus
        </Link>
      ) : null}

      <dl className="home-ws-review-metrics">
        <div>
          <dt>À réviser</dt>
          <dd>{stats.dueToday}</dd>
        </div>
        <div>
          <dt>Maîtrisées</dt>
          <dd>{stats.mastered}</dd>
        </div>
        {stats.streakDays > 0 ? (
          <div>
            <dt>Série</dt>
            <dd>{stats.streakDays} j</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5">
        <Link
          href="/review"
          className="focus-kb inline-flex items-center justify-center border border-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)]"
        >
          {stats.dueToday > 0 ? "Réviser maintenant →" : "Ouvrir Review →"}
        </Link>
      </div>
    </HomeSessionCard>
  );
}
