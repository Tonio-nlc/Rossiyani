"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  enqueueVocabularyReview,
  findVocabularyReviewItem,
  formatReviewState,
  getLocalReviewStats,
  isVocabularyInReview,
  removeVocabularyReview,
} from "@/lib/review";
import type { ReviewItemRecord, ReviewStats } from "@/lib/review";
import { getSavedReaderWords } from "@/lib/reader/saved-words";
import { formatRelativeEncounter } from "@/lib/vocabulary";
import type { VocabularyWordFiche } from "@/lib/vocabulary/vocabulary-word-fiche-types";

type VocabularyWordReviewPanelProps = {
  fiche: VocabularyWordFiche;
};

export function VocabularyWordReviewPanel({ fiche }: VocabularyWordReviewPanelProps) {
  const [inReview, setInReview] = useState(false);
  const [item, setItem] = useState<ReviewItemRecord | null>(null);
  const [stats, setStats] = useState<ReviewStats | null>(null);

  const refresh = useCallback(() => {
    setInReview(isVocabularyInReview(fiche.savedWordId));
    setItem(findVocabularyReviewItem(fiche.savedWordId));
    setStats(getLocalReviewStats());
  }, [fiche.savedWordId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleToggle = () => {
    const savedWord = getSavedReaderWords().find((entry) => entry.id === fiche.savedWordId);
    if (!savedWord) {
      return;
    }

    if (inReview) {
      removeVocabularyReview(savedWord.id);
    } else {
      enqueueVocabularyReview(savedWord, {
        translation: fiche.primaryTranslation,
        stressMarked: fiche.stressMarked,
        partOfSpeech: fiche.partOfSpeechLabel,
        exampleRussian: fiche.examples[0]?.russian ?? null,
        exampleTranslation: fiche.examples[0]?.translation ?? null,
        wordId: fiche.audioTarget.scope === "word" ? fiche.audioTarget.entityId : null,
      });
    }
    refresh();
  };

  return (
    <>
      <dl className="vocab-fiche-rows">
        <div className="vocab-fiche-rows__row">
          <dt>Enregistré</dt>
          <dd>{formatRelativeEncounter(fiche.review.savedAt)}</dd>
        </div>
        {item ? (
          <>
            <div className="vocab-fiche-rows__row">
              <dt>État</dt>
              <dd>{formatReviewState(item.state)}</dd>
            </div>
            <div className="vocab-fiche-rows__row">
              <dt>Répétitions</dt>
              <dd>{item.repetitions}</dd>
            </div>
          </>
        ) : null}
        <div className="vocab-fiche-rows__row">
          <dt>Textes</dt>
          <dd>
            {fiche.review.textCount} texte{fiche.review.textCount > 1 ? "s" : ""}
          </dd>
        </div>
        <div className="vocab-fiche-rows__row">
          <dt>Occurrences</dt>
          <dd>{fiche.review.occurrenceCount}</dd>
        </div>
        {fiche.review.sourceTextTitle ? (
          <div className="vocab-fiche-rows__row">
            <dt>Texte d&apos;origine</dt>
            <dd>
              <Link href={fiche.review.sourceTextHref} className="vocab-fiche__inline-link focus-kb">
                {fiche.review.sourceTextTitle}
              </Link>
            </dd>
          </div>
        ) : null}
        {stats && stats.dueToday > 0 ? (
          <div className="vocab-fiche-rows__row">
            <dt>À réviser aujourd&apos;hui</dt>
            <dd>{stats.dueToday} carte{stats.dueToday > 1 ? "s" : ""}</dd>
          </div>
        ) : null}
      </dl>
      <div className="vocab-fiche-review-actions">
        <button
          type="button"
          className="vocab-fiche-review-actions__btn focus-kb"
          onClick={handleToggle}
        >
          {inReview ? "Retirer des révisions" : "Ajouter aux révisions"}
        </button>
        {inReview ? (
          <Link
            href="/review"
            className="vocab-fiche-review-actions__btn vocab-fiche-review-actions__btn--link focus-kb"
          >
            Lancer une session
          </Link>
        ) : null}
      </div>
    </>
  );
}
