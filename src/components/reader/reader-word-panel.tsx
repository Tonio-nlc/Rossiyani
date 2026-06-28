"use client";

import { useMemo, useState } from "react";

import { PlayAudioButton } from "@/components/audio/play-audio-button";
import { POS_LABELS_FR } from "@/features/grammar";
import { buildReaderExplorerView } from "@/lib/reader/build-reader-explorer-view";
import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import type { ReaderTextPhraseIndex } from "@/lib/reader/build-reader-word-panel-data";
import {
  isReaderWordSaved,
  saveReaderWord,
} from "@/lib/reader/saved-words";
import type { PartOfSpeech } from "@/types";
import type { WordDetailGraph } from "@/types/word-detail-graph";
import type { ReaderPatternExperienceView } from "@/types/reader-pattern-experience";

import { ReaderExplorerSkeleton } from "./reader-explorer-skeleton";
import { ReaderIconSave } from "./reader-icon-button";
import { ReaderPatternCard } from "./reader-pattern-card";

type ReaderWordPanelProps = {
  detail: WordDetailGraph | null;
  loading?: boolean;
  snapshot: ReaderWordSnapshot | null;
  textIndex: ReaderTextPhraseIndex;
  patternExperience?: ReaderPatternExperienceView | null;
  onClose?: () => void;
};

/**
 * Rossiyani 2.0 word panel — translation + pattern experience only.
 * No grammar tabs, no review hooks, no encyclopedic analysis.
 */
export function ReaderWordPanel({
  detail,
  loading = false,
  snapshot,
  textIndex,
  patternExperience = null,
  onClose,
}: ReaderWordPanelProps) {
  const [saved, setSaved] = useState(false);

  const view = useMemo(
    () =>
      buildReaderExplorerView({
        detail,
        snapshot,
        textIndex,
        sentence: null,
      }),
    [detail, snapshot, textIndex],
  );

  const partOfSpeechLabel = snapshot?.partOfSpeech
    ? (POS_LABELS_FR[snapshot.partOfSpeech as PartOfSpeech] ?? snapshot.partOfSpeech)
    : view?.partOfSpeech;

  if (!snapshot) {
    return (
      <div className="reader-ws-explorer">
        <header className="reader-ws-explorer__head">
          <h2 className="reader-ws-explorer__title">Mot</h2>
        </header>
        <div className="reader-ws-explorer__empty">
          <p className="reader-ws-explorer__empty-title">Lisez d&apos;abord</p>
          <p className="reader-ws-explorer__empty-copy">
            Touchez un mot pour voir sa traduction. Les idées russes apparaissent au bon moment —
            jamais comme une leçon.
          </p>
        </div>
      </div>
    );
  }

  const isSaved =
    saved || isReaderWordSaved(snapshot.stressMarked || snapshot.original, snapshot.textId);

  const handleSave = () => {
    const entry = saveReaderWord({
      displayForm: snapshot.stressMarked || snapshot.original,
      lemma: snapshot.lemma,
      textId: snapshot.textId,
      isProperNoun: snapshot.isProperNoun,
    });
    if (entry) {
      setSaved(true);
    }
  };

  const showPatternCard = patternExperience?.visible ?? false;
  const translation = view?.dictionary.translation ?? snapshot.naturalTranslation ?? "—";

  return (
    <div className="reader-ws-explorer">
      <header className="reader-ws-explorer__head">
        <h2 className="reader-ws-explorer__title">Mot</h2>
        {onClose ? (
          <button type="button" className="reader-ws-explorer__close focus-kb" onClick={onClose}>
            Fermer
          </button>
        ) : null}
      </header>

      <article className="reader-ws-explorer__word-card">
        <div className="reader-ws-explorer__word-head">
          <div>
            <p className="reader-ws-explorer__word break-russian">
              {view?.headline ?? snapshot.stressMarked}
            </p>
            {view?.transliteration ? (
              <p className="reader-ws-explorer__translit">{view.transliteration}</p>
            ) : null}
          </div>
          <PlayAudioButton
            target={{ scope: "word", entityId: snapshot.id }}
            label="Écouter le mot"
            className="reader-ws-explorer__speak focus-kb"
            iconClassName="reader-ws-icon-btn__svg"
          />
        </div>
        {partOfSpeechLabel ? (
          <p className="reader-ws-explorer__card-label">{partOfSpeechLabel}</p>
        ) : null}
      </article>

      {showPatternCard ? <ReaderPatternCard experience={patternExperience!} /> : null}

      <div className="reader-ws-explorer__panel" role="region" aria-label="Traduction">
        {loading && !view ? <ReaderExplorerSkeleton /> : null}
        <article className="reader-ws-explorer__card">
          <p className="reader-ws-explorer__card-label">Traduction</p>
          <p className="reader-ws-explorer__card-value">{translation}</p>
        </article>
      </div>

      <footer className="reader-ws-explorer__actions">
        <button
          type="button"
          className="reader-ws-explorer__action focus-kb"
          onClick={handleSave}
          disabled={isSaved}
        >
          <ReaderIconSave />
          {isSaved ? "Mot enregistré" : "Enregistrer le mot"}
        </button>
      </footer>
    </div>
  );
}
