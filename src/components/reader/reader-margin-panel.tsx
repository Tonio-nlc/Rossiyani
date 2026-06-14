"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { buildAnnotationPanelData } from "@/lib/reader/build-annotation-panel-data";
import { isReaderWordSaved, saveReaderWord } from "@/lib/reader/saved-words";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import { CollapsibleSection, ReaderFoundAcross } from "./reader-found-across";

type ReaderMarginPanelProps = {
  detail: WordDetailGraph | null;
  loading: boolean;
  showAllTranslations: boolean;
  onToggleAllTranslations: (value: boolean) => void;
};

function PanelSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <p className="home-section-label">{label}</p>
      {children}
    </section>
  );
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
  loading,
  showAllTranslations,
  onToggleAllTranslations,
}: ReaderMarginPanelProps) {
  const panel = useMemo(() => (detail ? buildAnnotationPanelData(detail) : null), [detail]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!panel || !detail) {
      setSaved(false);
      return;
    }
    setSaved(isReaderWordSaved(panel.displayForm, detail.textId));
  }, [panel, detail]);

  if (loading && !detail) {
    return <p className="text-metadata animate-pulse text-[var(--ink-muted)]">…</p>;
  }

  if (!detail || !panel) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
          Click a word to explore its meaning, forms, and connections.
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

  const primaryLesson = panel.lessons[0];

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <p className="break-russian font-reader text-[clamp(1.75rem,4vw,2rem)] leading-none text-[var(--ink)]">
          {panel.displayForm}
        </p>
        {panel.translation ? (
          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
            {panel.translation.primary.join(" · ")}
          </p>
        ) : null}
      </header>

      {panel.usage ? (
        <PanelSection label="Why this form?">
          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">{panel.usage}</p>
        </PanelSection>
      ) : null}

      {panel.exampleSentence ? (
        <PanelSection label="Example">
          <p className="break-russian font-reader text-sm leading-relaxed text-[var(--ink)]">
            {panel.exampleSentence}
          </p>
        </PanelSection>
      ) : null}

      <ReaderFoundAcross
        explorerHref={panel.explorerHref}
        practiceHref={panel.practiceHref ?? "#"}
        textCount={detail.statistics.seenInTexts}
        lessonHref={primaryLesson?.href ?? null}
        lessonTitle={primaryLesson?.title ?? null}
      />

      {(panel.explorerHref || panel.practiceHref) && (
        <PanelSection label="Actions">
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
        </PanelSection>
      )}

      {panel.relations.length > 0 ? (
        <CollapsibleSection label="related forms">
          <ul className="space-y-1.5">
            {panel.relations.map((relation) => (
              <li key={relation.href}>
                <Link
                  href={relation.href}
                  className="focus-kb break-russian font-reader text-sm text-[var(--ink-secondary)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
                >
                  {relation.label}
                </Link>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      ) : null}

      {detail.statistics.occurrenceCount > 0 || detail.statistics.seenInTexts > 0 ? (
        <CollapsibleSection label="occurrences">
          <dl className="space-y-1 text-xs text-[var(--ink-secondary)]">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--ink-muted)]">In this text</dt>
              <dd>{detail.statistics.occurrenceCount}×</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--ink-muted)]">Across library</dt>
              <dd>{detail.statistics.seenInTexts} text{detail.statistics.seenInTexts === 1 ? "" : "s"}</dd>
            </div>
          </dl>
        </CollapsibleSection>
      ) : null}

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
