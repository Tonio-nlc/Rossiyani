"use client";

import { useMemo, useState } from "react";

import {
  buildReaderExplorerView,
  type ExplorerGrammarSection,
  type ReaderExplorerTab,
} from "@/lib/reader/build-reader-explorer-view";
import type { ReaderTextData } from "@/features/texts";
import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import type { ReaderTextPhraseIndex } from "@/lib/reader/build-reader-word-panel-data";
import { isReaderWordSaved, saveReaderWord } from "@/lib/reader/saved-words";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import { ReaderExplorerSkeleton } from "./reader-explorer-skeleton";
import { ReaderIconSave, ReaderIconSpeaker } from "./reader-icon-button";

type ReaderExplorerPanelProps = {
  detail: WordDetailGraph | null;
  loading?: boolean;
  snapshot: ReaderWordSnapshot | null;
  textIndex: ReaderTextPhraseIndex;
  sentence?: ReaderTextData["sentences"][number] | null;
};

const TABS: Array<{ id: ReaderExplorerTab; label: string }> = [
  { id: "dictionary", label: "Dictionary" },
  { id: "grammar", label: "Grammar" },
  { id: "context", label: "Context" },
];

function GrammarSectionCard({
  section,
  morphologyTags = [],
}: {
  section: ExplorerGrammarSection;
  morphologyTags?: string[];
}) {
  const chipLabels =
    section.id === "morphology" && morphologyTags.length > 0
      ? morphologyTags
      : section.id === "morphology"
        ? section.rows.map((row) => row.value)
        : [];

  return (
    <article className="reader-ws-explorer__card reader-ws-explorer__card--module">
      <h3 className="reader-ws-explorer__section-title">{section.title}</h3>

      {section.id === "morphology" && chipLabels.length > 0 ? (
        <div className="reader-ws-explorer__tags" aria-label="Morphology">
          {chipLabels.map((tag) => (
            <span key={tag} className="reader-ws-explorer__tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {section.id === "morphology" && section.rows.length > 0 ? (
        <dl className="reader-ws-explorer__rows">
          {section.rows.map((row) => (
            <div key={`${section.id}-${row.label}-${row.value}`} className="reader-ws-explorer__row">
              <dt>{row.label}</dt>
              <dd className="break-russian">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {section.id !== "morphology" && section.rows.length > 0 ? (
        <dl className="reader-ws-explorer__rows">
          {section.rows.map((row) => (
            <div key={`${section.id}-${row.label}-${row.value}`} className="reader-ws-explorer__row">
              <dt>{row.label}</dt>
              <dd className="break-russian">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {section.prose ? <p className="reader-ws-explorer__prose">{section.prose}</p> : null}
    </article>
  );
}

export function ReaderExplorerPanel({
  detail,
  loading = false,
  snapshot,
  textIndex,
  sentence = null,
}: ReaderExplorerPanelProps) {
  const [activeTab, setActiveTab] = useState<ReaderExplorerTab>("dictionary");
  const [saved, setSaved] = useState(false);

  const view = useMemo(
    () =>
      buildReaderExplorerView({
        detail,
        snapshot,
        textIndex,
        sentence,
      }),
    [detail, snapshot, textIndex, sentence],
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
        <div className="reader-ws-explorer__word-head">
          <div className="reader-ws-explorer__word-copy">
            <p className="reader-ws-explorer__word break-russian">
              {view?.headline ?? snapshot.stressMarked}
            </p>
            {view?.transliteration ? (
              <p className="reader-ws-explorer__translit">{view.transliteration}</p>
            ) : null}
          </div>
          <button type="button" className="reader-ws-explorer__speak focus-kb" aria-label="Pronunciation">
            <ReaderIconSpeaker />
          </button>
        </div>
        {view?.partOfSpeech ? (
          <div className="reader-ws-explorer__word-meta">
            <span className="reader-ws-explorer__tag reader-ws-explorer__tag--meta">
              {view.partOfSpeech}
            </span>
          </div>
        ) : null}
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
        {loading && !view ? <ReaderExplorerSkeleton /> : null}

        {activeTab === "dictionary" ? (
          <div className="reader-ws-explorer__stack">
            <article className="reader-ws-explorer__card reader-ws-explorer__card--module">
              <p className="reader-ws-explorer__card-label">Translation</p>
              <p className="reader-ws-explorer__card-value reader-ws-explorer__card-value--lead">
                {view?.dictionary.translation ?? "—"}
              </p>
              {view && view.dictionary.meanings.length > 1 ? (
                <div className="reader-ws-explorer__field">
                  <p className="reader-ws-explorer__card-label">Meanings</p>
                  <ul className="reader-ws-explorer__list">
                    {view.dictionary.meanings.map((meaning) => (
                      <li key={meaning}>{meaning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>

            {view && view.dictionary.examples.length > 0 ? (
              <article className="reader-ws-explorer__card reader-ws-explorer__card--module">
                <p className="reader-ws-explorer__card-label">Examples</p>
                <ul className="reader-ws-explorer__list reader-ws-explorer__list--examples">
                  {view.dictionary.examples.map((example) => (
                    <li key={example} className="break-russian">
                      {example}
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}
          </div>
        ) : null}

        {activeTab === "grammar" ? (
          <div className="reader-ws-explorer__stack">
            {view && view.grammar.sections.length > 0 ? (
              view.grammar.sections.map((section) => (
                <GrammarSectionCard
                  key={section.id}
                  section={section}
                  morphologyTags={section.id === "morphology" ? view.grammar.tags : undefined}
                />
              ))
            ) : (
              <article className="reader-ws-explorer__card reader-ws-explorer__card--module">
                <p className="reader-ws-explorer__muted">No grammar details available yet.</p>
              </article>
            )}
          </div>
        ) : null}

        {activeTab === "context" ? (
          <div className="reader-ws-explorer__stack">
            {view?.context.available ? (
              <>
                <article className="reader-ws-explorer__card reader-ws-explorer__card--module">
                  <p className="reader-ws-explorer__card-label">Context</p>
                  <p className="reader-ws-explorer__context-word break-russian">
                    {view.context.selectedWord}
                  </p>
                  {view.context.roleBullets.length > 0 ? (
                    <div className="reader-ws-explorer__context-block">
                      <p className="reader-ws-explorer__context-subhead">Used in this sentence as</p>
                      <ul className="reader-ws-explorer__context-bullets">
                        {view.context.roleBullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>

                {view.context.naturalMeaning ? (
                  <article className="reader-ws-explorer__card reader-ws-explorer__card--module">
                    <p className="reader-ws-explorer__card-label">Natural meaning in this sentence</p>
                    <p className="reader-ws-explorer__prose">{view.context.naturalMeaning}</p>
                  </article>
                ) : null}

                {view.context.sentenceFunction ? (
                  <article className="reader-ws-explorer__card reader-ws-explorer__card--module">
                    <p className="reader-ws-explorer__card-label">Function in the sentence</p>
                    <p className="reader-ws-explorer__card-value">{view.context.sentenceFunction}</p>
                  </article>
                ) : null}

                {view.context.relationships.length > 0 ? (
                  <article className="reader-ws-explorer__card reader-ws-explorer__card--module">
                    <p className="reader-ws-explorer__card-label">Relationship with nearby words</p>
                    <ul className="reader-ws-explorer__context-relations">
                      {view.context.relationships.map((relationship) => (
                        <li key={`${relationship.term}-${relationship.description}`}>
                          <span className="reader-ws-explorer__relation-term break-russian">
                            {relationship.term}
                          </span>
                          <span className="reader-ws-explorer__relation-desc">
                            {relationship.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ) : null}
              </>
            ) : (
              <article className="reader-ws-explorer__card reader-ws-explorer__card--module">
                <p className="reader-ws-explorer__muted">
                  Context analysis is not available for this word yet.
                </p>
              </article>
            )}
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
