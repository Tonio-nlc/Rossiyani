"use client";

import { useMemo, useState } from "react";

import {
  buildReaderExplorerView,
  type ReaderExplorerTab,
} from "@/lib/reader/build-reader-explorer-view";
import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import type { ReaderTextPhraseIndex } from "@/lib/reader/build-reader-word-panel-data";
import { isReaderWordSaved, saveReaderWord } from "@/lib/reader/saved-words";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import { ReaderIconSave, ReaderIconSpeaker } from "./reader-icon-button";

type ReaderExplorerPanelProps = {
  detail: WordDetailGraph | null;
  loading?: boolean;
  snapshot: ReaderWordSnapshot | null;
  textIndex: ReaderTextPhraseIndex;
};

const TABS: Array<{ id: ReaderExplorerTab; label: string }> = [
  { id: "dictionary", label: "Dictionary" },
  { id: "grammar", label: "Grammar" },
  { id: "context", label: "Context" },
];

export function ReaderExplorerPanel({
  detail,
  loading = false,
  snapshot,
  textIndex,
}: ReaderExplorerPanelProps) {
  const [activeTab, setActiveTab] = useState<ReaderExplorerTab>("dictionary");
  const [saved, setSaved] = useState(false);

  const view = useMemo(
    () =>
      buildReaderExplorerView({
        detail,
        snapshot,
        textIndex,
      }),
    [detail, snapshot, textIndex],
  );

  const handleSave = () => {
    if (!snapshot) {
      return;
    }
    saveReaderWord({
      displayForm: snapshot.stressMarked || snapshot.original,
      lemma: snapshot.lemma,
      textId: snapshot.textId,
    });
    setSaved(true);
  };

  if (!snapshot) {
    return (
      <div className="reader-ws-explorer">
        <header className="reader-ws-explorer__head">
          <h2 className="reader-ws-explorer__title">Explorer</h2>
        </header>
        <div className="reader-ws-explorer__empty">
          <span className="reader-ws-explorer__empty-icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" className="reader-ws-explorer__empty-icon-svg">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16.5 16.5 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8.5 11h5M11 8.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <p className="reader-ws-explorer__empty-title">Select a word</p>
          <p className="reader-ws-explorer__empty-copy">
            Tap any highlighted word in the text to see translation, grammar, and context.
          </p>
        </div>
      </div>
    );
  }

  const isSaved =
    saved || isReaderWordSaved(snapshot.stressMarked || snapshot.original, snapshot.textId);

  return (
    <div className="reader-ws-explorer">
      <header className="reader-ws-explorer__head">
        <h2 className="reader-ws-explorer__title">Explorer</h2>
      </header>

      <article className="reader-ws-explorer__word-card">
        <p className="reader-ws-explorer__word break-russian">{view?.headline ?? snapshot.stressMarked}</p>
        {view?.transliteration ? (
          <p className="reader-ws-explorer__translit">{view.transliteration}</p>
        ) : null}
        <button type="button" className="reader-ws-explorer__speak focus-kb" aria-label="Pronunciation">
          <ReaderIconSpeaker />
        </button>
      </article>

      <div className="reader-ws-explorer__tabs" role="tablist" aria-label="Word details">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={[
              "reader-ws-explorer__tab focus-kb",
              activeTab === tab.id ? "reader-ws-explorer__tab--active" : "",
            ].join(" ")}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="reader-ws-explorer__panel" role="tabpanel">
        {loading && !view ? (
          <p className="reader-ws-explorer__loading">Loading word details…</p>
        ) : null}

        {activeTab === "dictionary" ? (
          <div className="reader-ws-explorer__card">
            <p className="reader-ws-explorer__card-label">Translation</p>
            <p className="reader-ws-explorer__card-value">
              {view?.dictionary.translation ?? "—"}
            </p>
            {view && view.dictionary.meanings.length > 1 ? (
              <>
                <p className="reader-ws-explorer__card-label">Meanings</p>
                <ul className="reader-ws-explorer__list">
                  {view.dictionary.meanings.map((meaning) => (
                    <li key={meaning}>{meaning}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {view && view.dictionary.examples.length > 0 ? (
              <>
                <p className="reader-ws-explorer__card-label">Examples</p>
                <ul className="reader-ws-explorer__list reader-ws-explorer__list--examples">
                  {view.dictionary.examples.map((example) => (
                    <li key={example} className="break-russian">
                      {example}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}

        {activeTab === "grammar" ? (
          <div className="reader-ws-explorer__card reader-ws-explorer__card--grammar">
            {view && view.grammar.sections.length > 0 ? (
              view.grammar.sections.map((section) => (
                <section key={section.id} className="reader-ws-explorer__section">
                  <h3 className="reader-ws-explorer__section-title">{section.title}</h3>
                  {section.id === "morphology" && view.grammar.tags.length > 0 ? (
                    <div className="reader-ws-explorer__tags">
                      {view.grammar.tags.map((tag) => (
                        <span key={tag} className="reader-ws-explorer__tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {section.rows.length > 0 ? (
                    <dl className="reader-ws-explorer__rows">
                      {section.rows.map((row) => (
                        <div key={`${section.id}-${row.label}-${row.value}`}>
                          <dt>{row.label}</dt>
                          <dd className="break-russian">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {section.prose ? (
                    <p className="reader-ws-explorer__prose">{section.prose}</p>
                  ) : null}
                </section>
              ))
            ) : (
              <p className="reader-ws-explorer__muted">No grammar details available yet.</p>
            )}
          </div>
        ) : null}

        {activeTab === "context" ? (
          <div className="reader-ws-explorer__card">
            {view?.context.sentenceRussian ? (
              <>
                <p className="reader-ws-explorer__card-label">Sentence</p>
                <p className="reader-ws-explorer__card-value break-russian">
                  {view.context.sentenceRussian}
                </p>
              </>
            ) : null}
            {view?.context.sentenceMeaning ? (
              <>
                <p className="reader-ws-explorer__card-label">Meaning</p>
                <p className="reader-ws-explorer__card-value">{view.context.sentenceMeaning}</p>
              </>
            ) : null}
            {view?.context.usage ? (
              <>
                <p className="reader-ws-explorer__card-label">Usage</p>
                <p className="reader-ws-explorer__card-value">{view.context.usage}</p>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <footer className="reader-ws-explorer__actions">
        <button type="button" className="reader-ws-explorer__action reader-ws-explorer__action--ghost focus-kb">
          <ReaderIconSpeaker />
          Listen
        </button>
        <button
          type="button"
          className="reader-ws-explorer__action focus-kb"
          onClick={handleSave}
          disabled={isSaved}
        >
          <ReaderIconSave />
          {isSaved ? "Saved" : "Save Word"}
        </button>
      </footer>
    </div>
  );
}
