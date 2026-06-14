"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  buildReaderWordPanelData,
  collocationHref,
  type ReaderTextPhraseIndex,
} from "@/lib/reader/build-reader-word-panel-data";
import { isReaderWordSaved, saveReaderWord } from "@/lib/reader/saved-words";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type ReaderMarginPanelProps = {
  detail: WordDetailGraph | null;
  loading?: boolean;
  textIndex: ReaderTextPhraseIndex;
  agreementTarget?: string | null;
  showAllTranslations: boolean;
  onToggleAllTranslations: (value: boolean) => void;
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

function PanelSkeleton() {
  return (
    <div className="space-y-3 pt-1" aria-hidden>
      <div className="h-3 w-16 rounded bg-[var(--hairline)]" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-[var(--hairline)]" />
        <div className="h-3 w-[80%] rounded bg-[var(--hairline)]" />
      </div>
      <div className="h-3 w-20 rounded bg-[var(--hairline)]" />
      <div className="h-3 w-full rounded bg-[var(--hairline)]" />
      <div className="h-3 w-[60%] rounded bg-[var(--hairline)]" />
    </div>
  );
}

export function ReaderMarginPanel({
  detail,
  loading = false,
  textIndex,
  agreementTarget = null,
  showAllTranslations,
  onToggleAllTranslations,
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
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
          Select a word to see its meaning and grammar.
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
          <div className="h-3 w-32 rounded bg-[var(--hairline)]" aria-hidden />
        ) : null}
        {panel.partOfSpeech ? (
          <p className="text-xs text-[var(--ink-muted)]">{panel.partOfSpeech}</p>
        ) : null}
      </header>

      {loading ? (
        <PanelSkeleton />
      ) : (
        <>
          {panel.usedHere.length > 0 || panel.contextNotes.length > 0 ? (
            <section className="space-y-3">
              <PanelLabel>Used here</PanelLabel>
              {panel.usedHere.length > 0 ? (
                <dl className="space-y-1.5">
                  {panel.usedHere.map((row) => (
                    <div key={row.label} className="flex justify-between gap-3 text-sm">
                      <dt className="text-[var(--ink-muted)]">{row.label}</dt>
                      <dd className="text-[var(--ink-secondary)]">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {panel.contextNotes.map((note) => (
                <p key={note} className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                  {note}
                </p>
              ))}
            </section>
          ) : null}

          {panel.collocations.length > 0 ? (
            <section className="space-y-2">
              <PanelLabel>Collocations</PanelLabel>
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

          {panel.example ? (
            <section className="space-y-2">
              <PanelLabel>Example</PanelLabel>
              <p className="break-russian font-reader text-sm leading-relaxed text-[var(--ink-secondary)]">
                {panel.example}
              </p>
            </section>
          ) : null}

          {panel.foundIn.length > 0 ? (
            <section className="space-y-2 border-t border-[var(--hairline)] pt-4">
              <PanelLabel>Found in Rossiyani</PanelLabel>
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
                  <EditorialLink href={panel.explorerHref}>Explore</EditorialLink>
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
        </>
      )}

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
