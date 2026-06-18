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
import {
  buildWordSheetRationales,
  shouldShowLemmaFirst,
  surfaceFormLabel,
} from "@/lib/reader/word-sheet-rationale";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type ReaderMarginPanelProps = {
  detail: WordDetailGraph | null;
  loading?: boolean;
  textTitle: string;
  textIndex: ReaderTextPhraseIndex;
  textWords: InteractiveWordEntry[];
  timesSeenInText: number;
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

export function ReaderMarginPanel({
  detail,
  loading = false,
  textTitle,
  textIndex,
  textWords,
  timesSeenInText,
  agreementTarget = null,
  showAllTranslations,
  onToggleAllTranslations,
}: ReaderMarginPanelProps) {
  const panel = useMemo(
    () => (detail ? buildReaderWordPanelData(detail, textIndex, agreementTarget) : null),
    [detail, textIndex, agreementTarget],
  );
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const panelKey = detail?.wordId ?? "empty";

  useEffect(() => {
    setExpanded(false);
  }, [panelKey]);

  useEffect(() => {
    if (!panel || !detail) {
      setSaved(false);
      return;
    }
    setSaved(isReaderWordSaved(panel.displayForm, detail.textId));
  }, [panel, detail]);

  if (!detail || !panel) {
    return null;
  }

  const rationales = buildWordSheetRationales({
    textTitle,
    detail,
    panel,
    timesSeenInText,
  });
  const lemmaFirst = shouldShowLemmaFirst(panel);
  const formLabel = surfaceFormLabel(panel);
  const hasAdvancedContent =
    panel.usedHere.length > 0 ||
    panel.contextNotes.length > 0 ||
    panel.collocations.length > 0 ||
    panel.foundIn.length > 0;

  return (
    <div key={panelKey} className="animate-reader-panel-fade space-y-5">
      <header className="space-y-2 border-b border-[var(--hairline)] pb-4">
        {lemmaFirst ? (
          <>
            <p className="break-russian font-reader text-[clamp(1.5rem,3vw,1.875rem)] leading-none text-[var(--ink)]">
              {panel.lemma}
            </p>
            <p className="break-russian text-sm text-[var(--ink-muted)]">
              {panel.displayForm}
              {formLabel ? ` · ${formLabel}` : null}
            </p>
          </>
        ) : (
          <p className="break-russian font-reader text-[clamp(1.5rem,3vw,1.875rem)] leading-none text-[var(--ink)]">
            {panel.displayForm}
          </p>
        )}

        {panel.translation ? (
          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">{panel.translation}</p>
        ) : loading ? (
          <p className="text-sm text-[var(--ink-muted)]">…</p>
        ) : null}
      </header>

      <ul className="space-y-1">
        {rationales.map((line) => (
          <li key={line} className="text-xs leading-relaxed text-[var(--ink-muted)]">
            {line}
          </li>
        ))}
      </ul>

      {panel.example ? (
        <section className="space-y-2">
          <PanelLabel>Exemple</PanelLabel>
          <p className="break-russian font-reader text-sm leading-relaxed text-[var(--ink-secondary)]">
            {panel.example}
          </p>
        </section>
      ) : null}

      {hasAdvancedContent ? (
        <div>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="focus-kb text-sm font-medium text-[var(--ink)] underline-offset-4 transition hover:text-[var(--color-link)] hover:underline"
            aria-expanded={expanded}
          >
            {expanded ? "Voir moins" : "Voir plus"}
          </button>

          {expanded ? (
            <div className="mt-5 space-y-5 border-t border-[var(--hairline)] pt-5">
              {panel.partOfSpeech ? (
                <p className="text-xs text-[var(--ink-muted)]">{panel.partOfSpeech}</p>
              ) : null}

              {panel.usedHere.length > 0 ? (
                <section className="space-y-2">
                  <PanelLabel>Grammaire</PanelLabel>
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
                  <PanelLabel>Pourquoi cette forme</PanelLabel>
                  {panel.contextNotes.map((note) => (
                    <p key={note} className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                      {note}
                    </p>
                  ))}
                </section>
              ) : null}

              {panel.collocations.length > 0 ? (
                <section className="space-y-2">
                  <PanelLabel>Mots liés</PanelLabel>
                  <ul className="space-y-1.5">
                    {panel.collocations.map((label) => {
                      const href = collocationHref(label);
                      if (!href) {
                        return (
                          <li
                            key={label}
                            className="break-russian font-reader text-sm text-[var(--ink-secondary)]"
                          >
                            {label}
                          </li>
                        );
                      }
                      return (
                        <li key={label}>
                          <Link
                            href={href}
                            className="focus-kb break-russian font-reader text-sm text-[var(--ink)] underline-offset-2 hover:underline"
                          >
                            {label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              {panel.foundIn.length > 0 ? (
                <section className="space-y-2">
                  <PanelLabel>Occurrences</PanelLabel>
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
                <p className="text-xs text-[var(--ink-muted)]">
                  {textWords.length} mots interactifs dans ce texte
                </p>
              </section>
            </div>
          ) : null}
        </div>
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
              <EditorialLink href={panel.practiceHref}>Pratiquer</EditorialLink>
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
              {saved ? "✓ Enregistré" : "Enregistrer"}
            </button>
          </li>
        </ul>
      </section>

      <button
        type="button"
        onClick={() => onToggleAllTranslations(!showAllTranslations)}
        className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 hover:underline"
      >
        {showAllTranslations ? "Masquer les traductions" : "Afficher les traductions"}
      </button>
    </div>
  );
}
