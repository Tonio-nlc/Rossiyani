"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PlayAudioButton } from "@/components/audio/play-audio-button";
import {
  formatReviewState,
  getLocalDueCards,
  getLocalReviewStats,
  REVIEW_RATING_ACTIONS,
  submitLocalReviewAnswer,
} from "@/lib/review";
import type { ReviewItemRecord, ReviewSessionCard, ReviewStats } from "@/lib/review";

const TYPE_LABELS: Record<ReviewItemRecord["type"], string> = {
  vocabulary: "Vocabulaire",
  expression: "Expression",
  grammar: "Construction",
};

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 1) {
    return "< 1 min";
  }
  return `${minutes} min`;
}

function ReviewStatsBar({ stats }: { stats: ReviewStats }) {
  return (
    <dl className="review-ws__stats">
      <div>
        <dt>À réviser</dt>
        <dd>{stats.dueToday}</dd>
      </div>
      <div>
        <dt>Maîtrisées</dt>
        <dd>{stats.mastered}</dd>
      </div>
      <div>
        <dt>Progression</dt>
        <dd>
          {stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0}%
        </dd>
      </div>
      {stats.streakDays > 0 ? (
        <div>
          <dt>Série</dt>
          <dd>{stats.streakDays} j</dd>
        </div>
      ) : null}
      {stats.totalReviewTimeMs > 0 ? (
        <div>
          <dt>Temps total</dt>
          <dd>{formatDuration(stats.totalReviewTimeMs)}</dd>
        </div>
      ) : null}
    </dl>
  );
}

function ReviewCardFace({
  card,
  revealed,
  onReveal,
}: {
  card: ReviewSessionCard;
  revealed: boolean;
  onReveal: () => void;
}) {
  const { item } = card;
  const { content } = item;

  return (
    <article className="review-ws__card">
      <header className="review-ws__card-head">
        <p className="review-ws__card-type">{TYPE_LABELS[item.type]}</p>
        <p className="review-ws__card-state">{formatReviewState(item.state)}</p>
      </header>

      <div className="review-ws__card-body">
        <p className="review-ws__prompt break-russian">{content.prompt}</p>
        {content.hint && !revealed ? (
          <p className="review-ws__hint">{content.hint}</p>
        ) : null}

        {!revealed ? (
          <button type="button" className="review-ws__reveal focus-kb" onClick={onReveal}>
            Révéler le sens
          </button>
        ) : (
          <div className="review-ws__answer-block">
            <p className="review-ws__answer">{content.answer}</p>
            {content.exampleRussian ? (
              <blockquote className="review-ws__example">
                <p className="break-russian">{content.exampleRussian}</p>
                {content.exampleTranslation ? (
                  <footer>{content.exampleTranslation}</footer>
                ) : null}
              </blockquote>
            ) : null}
            {content.partOfSpeech ? (
              <p className="review-ws__pos">{content.partOfSpeech}</p>
            ) : null}
            <div className="review-ws__card-links">
              {content.audioTarget ? (
                <PlayAudioButton
                  target={content.audioTarget}
                  label="Écouter"
                  className="review-ws__audio focus-kb"
                  iconClassName="review-ws__audio-icon"
                />
              ) : null}
              {content.vocabularyHref ? (
                <Link href={content.vocabularyHref} className="review-ws__link focus-kb">
                  Fiche
                </Link>
              ) : null}
              {content.sourceTextHref ? (
                <Link href={content.sourceTextHref} className="review-ws__link focus-kb">
                  {content.sourceTextTitle ?? "Texte source"}
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function ReviewRatingBar({ onRate }: { onRate: (rating: (typeof REVIEW_RATING_ACTIONS)[number]["rating"]) => void }) {
  return (
    <div className="review-ws__ratings" role="group" aria-label="Évaluer la réponse">
      {REVIEW_RATING_ACTIONS.map((action) => (
        <button
          key={action.rating}
          type="button"
          className={`review-ws__rating review-ws__rating--${action.rating} focus-kb`}
          onClick={() => onRate(action.rating)}
        >
          <span className="review-ws__rating-label">{action.label}</span>
          <span className="review-ws__rating-hint">{action.hint}</span>
        </button>
      ))}
    </div>
  );
}

function ReviewSessionComplete({
  reviewedCount,
  stats,
  onRestart,
}: {
  reviewedCount: number;
  stats: ReviewStats;
  onRestart: () => void;
}) {
  return (
    <div className="review-ws__complete">
      <h2 className="review-ws__complete-title">Session terminée</h2>
      <p className="review-ws__complete-copy">
        {reviewedCount} carte{reviewedCount > 1 ? "s" : ""} révisée{reviewedCount > 1 ? "s" : ""}.
        {stats.dueToday > 0
          ? ` Encore ${stats.dueToday} pour aujourd'hui.`
          : " Vous êtes à jour pour aujourd'hui."}
      </p>
      <div className="review-ws__complete-actions">
        {stats.dueToday > 0 ? (
          <button type="button" className="review-ws__primary focus-kb" onClick={onRestart}>
            Continuer
          </button>
        ) : null}
        <Link href="/reader" className="review-ws__secondary focus-kb">
          Retour à la lecture
        </Link>
      </div>
    </div>
  );
}

export function ReviewWorkspace() {
  const [stats, setStats] = useState<ReviewStats>(() => getLocalReviewStats());
  const [queue, setQueue] = useState<ReviewSessionCard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);

  const loadSession = useCallback(() => {
    const cards = getLocalDueCards();
    setQueue(cards);
    setIndex(0);
    setRevealed(false);
    setComplete(cards.length === 0);
    setStartedAt(cards.length > 0 ? Date.now() : null);
    setStats(getLocalReviewStats());
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const current = queue[index] ?? null;
  const progressLabel = useMemo(() => {
    if (queue.length === 0) {
      return null;
    }
    return `${index + 1} / ${queue.length}`;
  }, [index, queue.length]);

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleRate = (rating: (typeof REVIEW_RATING_ACTIONS)[number]["rating"]) => {
    if (!current) {
      return;
    }
    const timeMs = startedAt ? Date.now() - startedAt : undefined;
    submitLocalReviewAnswer({ itemId: current.item.id, rating, timeMs });
    setSessionReviewed((count) => count + 1);
    setStartedAt(Date.now());
    setRevealed(false);

    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      setStats(getLocalReviewStats());
      setComplete(true);
      return;
    }
    setIndex(nextIndex);
  };

  return (
    <div className="review-ws">
      <header className="review-ws__header">
        <div>
          <p className="review-ws__eyebrow">Révision</p>
          <h1 className="review-ws__title">Mémoriser ce que vous avez lu</h1>
          <p className="review-ws__lead">
            Quelques minutes pour ancrer le vocabulaire, les expressions et les constructions de vos
            lectures.
          </p>
        </div>
        {progressLabel ? <p className="review-ws__progress">{progressLabel}</p> : null}
      </header>

      <ReviewStatsBar stats={stats} />

      {complete ? (
        <ReviewSessionComplete
          reviewedCount={sessionReviewed}
          stats={getLocalReviewStats()}
          onRestart={loadSession}
        />
      ) : current ? (
        <>
          <ReviewCardFace card={current} revealed={revealed} onReveal={handleReveal} />
          {revealed ? <ReviewRatingBar onRate={handleRate} /> : null}
        </>
      ) : (
        <div className="review-ws__empty">
          <h2 className="review-ws__empty-title">Rien à réviser pour l&apos;instant</h2>
          <p className="review-ws__empty-copy">
            Enregistrez des mots pendant vos lectures — ils apparaîtront ici automatiquement.
          </p>
          <Link href="/reader" className="review-ws__primary focus-kb">
            Ouvrir le Reader
          </Link>
        </div>
      )}
    </div>
  );
}
