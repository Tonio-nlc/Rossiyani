"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  buildReaderWordPanelData,
  collocationHref,
  type ReaderTextPhraseIndex,
} from "@/lib/reader/build-reader-word-panel-data";
import { buildReaderMicroscopeFacts } from "@/lib/reader/build-reader-microscope-facts";
import type { InteractiveWordEntry } from "@/lib/reader/build-interactive-words";
import { isReaderWordSaved, saveReaderWord } from "@/lib/reader/saved-words";
import {
  buildWordSheetRationales,
  shouldShowLemmaFirst,
  surfaceFormLabel,
} from "@/lib/reader/word-sheet-rationale";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import { GhostButton } from "@/components/design-system";

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
  const linguisticFacts = useMemo(
    () => (detail ? buildReaderMicroscopeFacts(detail, textIndex) : []),
    [detail, textIndex],
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
  const showCollocationChips =
    panel.collocations.length > 0 &&
    !linguisticFacts.some((fact) => fact.label === "Collocation" || fact.label === "Observé avec");
  const hasAdvancedContent = panel.foundIn.length > 0;

  return (
    <div key={panelKey} className="reader-microscope animate-reader-panel-fade">
      <header className="reader-microscope__word">
        {lemmaFirst ? (
          <>
            <p className="reader-microscope__headline break-russian">{panel.lemma}</p>
            <p className="reader-microscope__surface break-russian">
              {panel.displayForm}
              {formLabel ? ` · ${formLabel}` : null}
            </p>
          </>
        ) : (
          <p className="reader-microscope__headline break-russian">{panel.displayForm}</p>
        )}

        {panel.translation ? (
          <p className="reader-microscope__definition">{panel.translation}</p>
        ) : loading ? (
          <p className="reader-microscope__definition reader-microscope__definition--loading">…</p>
        ) : null}
      </header>

      <div className="reader-microscope__actions">
        {panel.explorerHref ? (
          <GhostButton href={panel.explorerHref} className="reader-microscope__action">
            Explorer →
          </GhostButton>
        ) : null}
        {panel.practiceHref ? (
          <GhostButton href={panel.practiceHref} className="reader-microscope__action">
            Pratiquer →
          </GhostButton>
        ) : null}
        <GhostButton
          className="reader-microscope__action"
          onClick={() => {
            saveReaderWord({
              displayForm: panel.displayForm,
              lemma: panel.lemma,
              textId: detail.textId,
            });
            setSaved(true);
          }}
        >
          {saved ? "Enregistré" : "Enregistrer →"}
        </GhostButton>
      </div>

      {linguisticFacts.length > 0 ? (
        <dl className="reader-microscope__dashboard">
          {linguisticFacts.map((fact) => (
            <div key={`${fact.label}-${fact.value}`} className="reader-microscope__fact">
              <dt className="reader-microscope__fact-label">{fact.label}</dt>
              <dd className="reader-microscope__fact-value break-russian">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {rationales.length > 0 ? (
        <ul className="reader-microscope__notes">
          {rationales.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}

      {showCollocationChips ? (
        <div className="reader-microscope__block">
          <p className="reader-microscope__block-label">Constructions</p>
          <ul className="reader-microscope__chip-list">
            {panel.collocations.map((label) => {
              const href = collocationHref(label);
              if (!href) {
                return (
                  <li key={label}>
                    <span className="reader-microscope__chip reader-microscope__chip--static break-russian">
                      {label}
                    </span>
                  </li>
                );
              }
              return (
                <li key={label}>
                  <Link href={href} className="reader-microscope__chip focus-kb break-russian">
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {hasAdvancedContent ? (
        <div className="reader-microscope__more">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="reader-microscope__more-toggle focus-kb"
            aria-expanded={expanded}
          >
            {expanded ? "Voir moins" : "Explorer davantage"}
          </button>

          {expanded ? (
            <div className="reader-microscope__more-body">
              {panel.foundIn.length > 0 ? (
                <div className="reader-microscope__block">
                  <p className="reader-microscope__block-label">Liens</p>
                  <ul className="reader-microscope__text-list">
                    {panel.foundIn.map((item) => (
                      <li key={item.label}>
                        <Link href={item.href} className="reader-microscope__text-link focus-kb">
                          <span className="reader-microscope__text-title">{item.label}</span>
                          <span className="reader-microscope__text-detail">{item.detail}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <p className="reader-microscope__interactive-count">
                {textWords.length} mots interactifs dans ce texte
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onToggleAllTranslations(!showAllTranslations)}
        className="reader-microscope__translations-toggle focus-kb"
      >
        {showAllTranslations ? "Masquer les traductions" : "Afficher les traductions"}
      </button>
    </div>
  );
}
