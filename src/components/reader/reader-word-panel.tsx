"use client";

import { useMemo, useState } from "react";

import { buildReaderExplorerView } from "@/lib/reader/build-reader-explorer-view";
import { buildReaderWordGuide } from "@/lib/reader/build-reader-word-guide";
import { isPatternBearerWord } from "@/lib/reader/build-pattern-bearer-words";
import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import type { ReaderTextPhraseIndex } from "@/lib/reader/build-reader-word-panel-data";
import {
  isReaderWordSaved,
  saveReaderWord,
} from "@/lib/reader/saved-words";
import type { ReaderTextData } from "@/features/texts";
import type { WordDetailGraph } from "@/types/word-detail-graph";
import type { ReaderPatternExperienceView } from "@/types/reader-pattern-experience";

import { ReaderExplorerSkeleton } from "./reader-explorer-skeleton";
import { ReaderWordGuide } from "./reader-word-guide";
import { ReaderWordLookupStrip } from "./reader-word-lookup-strip";

type ReaderWordPanelProps = {
  text: ReaderTextData;
  patternBearerBySentence: Map<string, Set<string>>;
  detail: WordDetailGraph | null;
  loading?: boolean;
  snapshot: ReaderWordSnapshot | null;
  textIndex: ReaderTextPhraseIndex;
  patternExperience?: ReaderPatternExperienceView | null;
  onClose?: () => void;
};

/**
 * Rossiyani 2.0 — pedagogical guide panel. Logic first, vocabulary second.
 */
export function ReaderWordPanel({
  text,
  patternBearerBySentence,
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

  const guide = useMemo(() => {
    if (!snapshot) {
      return null;
    }
    return buildReaderWordGuide({
      text,
      snapshot,
      patternExperience,
      isPatternBearer: isPatternBearerWord(
        patternBearerBySentence,
        snapshot.sentenceId,
        snapshot.id,
      ),
    });
  }, [text, snapshot, patternExperience, patternBearerBySentence]);

  if (!snapshot) {
    return (
      <div className="reader-ws-explorer reader-ws-explorer--guide">
        <header className="reader-ws-explorer__head">
          <h2 className="reader-ws-explorer__title reader-ws-explorer__title--guide">
            Rossiyani
          </h2>
        </header>
        <div className="reader-ws-explorer__empty">
          <p className="reader-ws-explorer__empty-title">Lisez d&apos;abord</p>
          <p className="reader-ws-explorer__empty-copy">
            Touchez un mot souligné quand une forme vous intrigue — Rossiyani vous montrera ce
            qui change.
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

  const translation = view?.dictionary.translation ?? snapshot.naturalTranslation ?? "—";
  const isGuide = guide?.mode === "guide";

  return (
    <div className="reader-ws-explorer reader-ws-explorer--guide">
      <header className="reader-ws-explorer__head">
        <h2 className="reader-ws-explorer__title reader-ws-explorer__title--guide">
          {isGuide ? "Pourquoi ainsi ?" : "Mot"}
        </h2>
        {onClose ? (
          <button type="button" className="reader-ws-explorer__close focus-kb" onClick={onClose}>
            Fermer
          </button>
        ) : null}
      </header>

      {loading && !view ? <ReaderExplorerSkeleton /> : null}

      {isGuide && guide ? (
        <ReaderWordGuide guide={guide} />
      ) : (
        <div className="reader-word-lookup-only">
          <p className="reader-word-lookup-only__hint">
            Traduction — pas de leçon ici. Les mots soulignés cachent une logique à découvrir.
          </p>
        </div>
      )}

      <ReaderWordLookupStrip
        snapshot={snapshot}
        translation={translation}
        partOfSpeechLabel={view?.partOfSpeech ?? null}
        isSaved={isSaved}
        onSave={handleSave}
        compact={isGuide}
      />
    </div>
  );
}
