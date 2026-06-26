"use client";

import { useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { buildReaderMicroscopeView } from "@/lib/reader/build-reader-microscope-view";
import type { ReaderTextPhraseIndex } from "@/lib/reader/build-reader-word-panel-data";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type ReaderMarginPanelProps = {
  detail: WordDetailGraph | null;
  loading?: boolean;
  textIndex: ReaderTextPhraseIndex;
  showAllTranslations: boolean;
  onToggleAllTranslations: (value: boolean) => void;
};

export function ReaderMarginPanel({
  detail,
  loading = false,
  textIndex,
  showAllTranslations,
  onToggleAllTranslations,
}: ReaderMarginPanelProps) {
  const view = useMemo(
    () => (detail ? buildReaderMicroscopeView(detail, textIndex) : null),
    [detail, textIndex],
  );

  if (!detail || !view) {
    return null;
  }

  return (
    <div className="reader-microscope animate-reader-panel-fade">
      <header className="reader-microscope__header">
        <p className="reader-microscope__headline break-russian">{view.headline}</p>
        {view.lemma ? (
          <p className="reader-microscope__lemma break-russian">
            <span className="reader-microscope__lemma-label">Lemme</span>
            {view.lemma}
          </p>
        ) : null}
        {view.metadataLine ? (
          <p className="reader-microscope__metadata">{view.metadataLine}</p>
        ) : null}
        {view.translation ? (
          <p className="reader-microscope__definition">{view.translation}</p>
        ) : loading ? (
          <Skeleton className="reader-microscope__definition-skeleton" />
        ) : null}
        {view.frequencyLabel ? (
          <p className="reader-microscope__frequency">{view.frequencyLabel}</p>
        ) : null}
      </header>

      {view.sections.map((section) => (
        <section key={section.id} className="reader-microscope__section">
          <h3 className="reader-microscope__section-title">{section.title}</h3>
          {section.note ? (
            <p className="reader-microscope__section-note">{section.note}</p>
          ) : null}
          {section.rows.length > 0 ? (
            <dl className="reader-microscope__rows">
              {section.rows.map((row) => (
                <div key={`${section.id}-${row.label}`} className="reader-microscope__row">
                  <dt className="reader-microscope__row-label">{row.label}</dt>
                  <dd className="reader-microscope__row-value break-russian">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      ))}

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
