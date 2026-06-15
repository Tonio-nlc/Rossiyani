"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  buildReaderWordPanelData,
  collocationHref,
  type ReaderTextPhraseIndex,
} from "@/lib/reader/build-reader-word-panel-data";
import type { InteractiveWordEntry } from "@/lib/reader/build-interactive-words";
import { isReaderWordSaved, saveReaderWord } from "@/lib/reader/saved-words";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type ReaderMarginPanelProps = {
  detail: WordDetailGraph | null;
  loading?: boolean;
  textIndex: ReaderTextPhraseIndex;
  textWords: InteractiveWordEntry[];
  activeWordId: string | null;
  agreementTarget?: string | null;
  showAllTranslations: boolean;
  onToggleAllTranslations: (value: boolean) => void;
  onHoverWord: (entry: InteractiveWordEntry) => void;
  onSelectWord: (entry: InteractiveWordEntry) => void;
  onHoverWordLeave: () => void;
};

function PanelLabel({ children }: { children: ReactNode }) {
  return <p className="home-section-label">{children}</p>;
}

function EditorialLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline"
    >
      {children}
    </Link>
  );
}

export function ReaderMarginPanel({
  detail,
  loading = false,
  textIndex,
  textWords,
  activeWordId,
  agreementTarget = null,
  showAllTranslations,
  onToggleAllTranslations,
  onHoverWord,
  onSelectWord,
  onHoverWordLeave,
}: ReaderMarginPanelProps) {
  const panel = useMemo(
    () => (detail ? buildReaderWordPanelData(detail, textIndex, agreementTarget) : null),
    [detail, textIndex, agreementTarget],
  );
  const [saved, setSaved] = useState(false);
  const panelKey = detail?.wordId ?? "empty";

  useEffect(() => {
    if (!panel || !detail) {
      setSaved(false);
      return;
    }
    setSaved(isReaderWordSaved(panel.displayForm, detail.textId));
  }, [panel, detail]);

  if (!detail || !panel) {
    return (
      <div className="space-y-5">
        <div>
          <PanelLabel>Words in this text</PanelLabel>
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
            {textWords.map((entry) => (
              <li key={`${entry.sentenceId}-${entry.id}`}>
                <button
                  type="button"
                  onPointerEnter={() => onHoverWord(entry)}
                  onPointerLeave={onHoverWordLeave}
                  onClick={() => onSelectWord(entry)}
                  className={[
                    "reader-word-interactive focus-kb break-russian font-reader text-sm text-[var(--ink-secondary)] transition hover:text-[var(--ink)]",
                    activeWordId === entry.id ? "text-[var(--ink)]" : "",
                  ].join(" ")}
                >
                  {entry.display}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs leading-relaxed text-[var(--ink-muted)]">
          Hover any highlighted word to explore it.
        </p>
        <button
          type="button"
          onClick={() => onToggleAllTranslations(!showAllTranslations)}
          className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 hover:underline"
        >
          {showAllTranslations ? "Hide all translations" : "Show all translations"}
        </button>
      </div>
    );
  }

  return (
    <div key={panelKey} className="animate-reader-panel-fade space-y-5">
      <header className="space-y-2 border-b border-[var(--hairline)] pb-4">
        <p className="break-russian font-reader text-[clamp(1.5rem,3vw,1.875rem)] leading-none text-[var(--ink)]">
          {panel.displayForm}
        </p>
        {panel.translation ? (
          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">{panel.translation}</p>
        ) : loading ? (
          <p className="text-sm text-[var(--ink-muted)]">…</p>
        ) : null}
        {panel.partOfSpeech ? (
          <p className="text-xs text-[var(--ink-muted)]">{panel.partOfSpeech}</p>
        ) : null}
      </header>

      {panel.usedHere.length > 0 ? (
        <section className="space-y-2">
          <PanelLabel>Grammar</PanelLabel>
          <dl className="space-y-1.5">
            {panel.usedHere.map((row) => (
              <div key={row.label} className="flex justify-between gap-3 text-sm">
                <dt className="text-[var(--ink-muted)]">{row.label}</dt>
                <dd className="text-[var(--ink-secondary)]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {panel.contextNotes.length > 0 ? (
        <section className="space-y-2">
          <PanelLabel>Why this form</PanelLabel>
          {panel.contextNotes.map((note) => (
            <p key={note} className="text-sm leading-relaxed text-[var(--ink-secondary)]">
              {note}
            </p>
          ))}
        </section>
      ) : null}

      {panel.example ? (
        <section className="space-y-2">
          <PanelLabel>Examples</PanelLabel>
          <p className="break-russian font-reader text-sm leading-relaxed text-[var(--ink-secondary)]">
            {panel.example}
          </p>
        </section>
      ) : null}

      {panel.collocations.length > 0 ? (
        <section className="space-y-2">
          <PanelLabel>Related words</PanelLabel>
          <ul className="space-y-1.5">
            {panel.collocations.map((label) => (
              <li key={label}>
                <Link
                  href={collocationHref(label)}
                  className="focus-kb break-russian font-reader text-sm text-[var(--ink)] underline-offset-2 hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {panel.foundIn.length > 0 ? (
        <section className="space-y-2">
          <PanelLabel>Reader occurrence</PanelLabel>
          <ul className="space-y-2">
            {panel.foundIn.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="focus-kb group block transition hover:text-[var(--color-link)]"
                >
                  <span className="text-sm text-[var(--ink)]">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-[var(--ink-muted)] group-hover:text-[var(--ink-secondary)]">
                    {item.detail}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-2 border-t border-[var(--hairline)] pt-4">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {panel.explorerHref ? (
            <li>
              <EditorialLink href={panel.explorerHref}>Explorer</EditorialLink>
            </li>
          ) : null}
          {panel.practiceHref ? (
            <li>
              <EditorialLink href={panel.practiceHref}>Practice</EditorialLink>
            </li>
          ) : null}
          <li>
            <button
              type="button"
              onClick={() => {
                saveReaderWord({
                  displayForm: panel.displayForm,
                  lemma: panel.lemma,
                  textId: detail.textId,
                });
                setSaved(true);
              }}
              className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline"
            >
              {saved ? "✓ Saved" : "Save"}
            </button>
          </li>
        </ul>
      </section>

      <button
        type="button"
        onClick={() => onToggleAllTranslations(!showAllTranslations)}
        className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 hover:underline"
      >
        {showAllTranslations ? "Hide all translations" : "Show all translations"}
      </button>
    </div>
  );
}
