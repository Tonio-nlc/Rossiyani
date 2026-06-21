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

function MicroscopeBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="reader-microscope__block">
      <p className="reader-microscope__block-label">{label}</p>
      <div className="reader-microscope__block-body">{children}</div>
    </div>
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

      {rationales.length > 0 ? (
        <ul className="reader-microscope__notes">
          {rationales.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}

      {panel.example ? (
        <MicroscopeBlock label="Exemple">
          <p className="reader-microscope__example break-russian">{panel.example}</p>
        </MicroscopeBlock>
      ) : null}

      {hasAdvancedContent ? (
        <div className="reader-microscope__more">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="reader-microscope__more-toggle focus-kb"
            aria-expanded={expanded}
          >
            {expanded ? "Voir moins" : "Voir plus"}
          </button>

          {expanded ? (
            <div className="reader-microscope__more-body">
              {panel.partOfSpeech ? (
                <p className="reader-microscope__pos">{panel.partOfSpeech}</p>
              ) : null}

              {panel.usedHere.length > 0 ? (
                <MicroscopeBlock label="Grammaire">
                  <dl className="reader-microscope__facts">
                    {panel.usedHere.map((row) => (
                      <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </MicroscopeBlock>
              ) : null}

              {panel.contextNotes.length > 0 ? (
                <MicroscopeBlock label="Pourquoi cette forme">
                  {panel.contextNotes.map((note) => (
                    <p key={note} className="reader-microscope__note-text">
                      {note}
                    </p>
                  ))}
                </MicroscopeBlock>
              ) : null}

              {panel.collocations.length > 0 ? (
                <MicroscopeBlock label="Mots liés">
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
                </MicroscopeBlock>
              ) : null}

              {panel.foundIn.length > 0 ? (
                <MicroscopeBlock label="Occurrences">
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
                </MicroscopeBlock>
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
