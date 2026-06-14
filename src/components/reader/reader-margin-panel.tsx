"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { buildAnnotationPanelData } from "@/lib/reader/build-annotation-panel-data";
import { isReaderWordSaved, saveReaderWord } from "@/lib/reader/saved-words";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import { ReaderFoundAcross } from "./reader-found-across";

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
          className="focus-kb text-sm text-[var(--ink-secondary)] underline-offset-2 hover:underline"
        >
          {showAllTranslations ? "Hide all translations" : "Show all translations"}
        </button>
      </div>
    );
  }

  const primaryLesson = panel.lessons[0];
  const readHref = panel.explorerHref;

  return (
    <div className="space-y-5">
      <header className="space-y-3 border-b border-[var(--hairline)] pb-4">
        <p className="break-russian font-reader text-[clamp(1.75rem,4vw,2rem)] leading-none text-[var(--ink)]">
          {panel.displayForm}
        </p>
        {panel.translation ? (
          <p className="text-base leading-relaxed text-[var(--ink)]">
            {panel.translation.primary.join(" · ")}
          </p>
        ) : null}
        <dl className="space-y-1 text-sm text-[var(--ink-secondary)]">
          {panel.lemma ? (
            <div className="flex gap-2">
              <dt className="text-[var(--ink-muted)]">Base form</dt>
              <dd className="break-russian font-reader text-[var(--ink)]">{panel.lemma}</dd>
            </div>
          ) : null}
          {panel.partOfSpeech ? (
            <div className="flex gap-2">
              <dt className="text-[var(--ink-muted)]">Part of speech</dt>
              <dd>{panel.partOfSpeech}</dd>
            </div>
          ) : null}
        </dl>
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

      {panel.relations.length > 0 ? (
        <PanelSection label="Related forms">
          <ul className="space-y-2">
            {panel.relations.map((relation) => (
              <li key={relation.href}>
                <Link
                  href={relation.href}
                  className="focus-kb break-russian font-reader text-sm text-[var(--ink)] underline-offset-2 hover:text-[var(--color-link)] hover:underline"
                >
                  {relation.label}
                </Link>
              </li>
            ))}
          </ul>
        </PanelSection>
      ) : null}

      <ReaderFoundAcross
        lessonHref={primaryLesson ? primaryLesson.href : null}
        lessonTitle={primaryLesson?.title ?? null}
        textCount={detail.statistics.seenInTexts}
        readHref={readHref}
        practiceHref={panel.practiceHref ?? "#"}
      />

      {(panel.explorerHref || panel.practiceHref) && (
        <PanelSection label="Actions">
          <ul className="space-y-2 text-sm font-medium">
            {panel.explorerHref ? (
              <li>
                <Link
                  href={panel.explorerHref}
                  className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
                >
                  Open in Explorer →
                </Link>
              </li>
            ) : null}
            {panel.practiceHref ? (
              <li>
                <Link
                  href={panel.practiceHref}
                  className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
                >
                  Practice →
                </Link>
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
                className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
              >
                {saved ? "✓ Saved" : "Save"}
              </button>
            </li>
          </ul>
        </PanelSection>
      )}

      {panel.lessons.length > 1 ? (
        <PanelSection label="Manual">
          <ul className="space-y-1.5">
            {panel.lessons.slice(1).map((lesson) => (
              <li key={lesson.href}>
                <Link
                  href={lesson.href}
                  className="focus-kb text-sm text-[var(--ink)] underline-offset-2 hover:underline"
                >
                  {lesson.title}
                </Link>
              </li>
            ))}
          </ul>
        </PanelSection>
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
