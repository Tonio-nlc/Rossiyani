"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";

import { MetadataLine, Reference } from "@/components/editorial";
import { MarginNote } from "@/components/editorial/margin-note";
import { buildAnnotationPanelData } from "@/lib/reader/build-annotation-panel-data";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type ReaderMarginPanelProps = {
  detail: WordDetailGraph | null;
  loading: boolean;
  showTranslations: boolean;
  onToggleTranslations: (value: boolean) => void;
};

function AnnotationSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-[var(--space-2)]">
      <p className="home-section-label">{title}</p>
      {children}
    </section>
  );
}

export function ReaderMarginPanel({
  detail,
  loading,
  showTranslations,
  onToggleTranslations,
}: ReaderMarginPanelProps) {
  const panel = useMemo(() => (detail ? buildAnnotationPanelData(detail) : null), [detail]);

  if (loading && !detail) {
    return <p className="text-metadata animate-pulse text-[var(--ink-muted)]">…</p>;
  }

  if (!detail || !panel) {
    return (
      <div className="space-y-[var(--space-4)]">
        <p className="text-metadata leading-relaxed text-[var(--ink-muted)]">Click on a word.</p>
        <p className="text-metadata leading-relaxed text-[var(--ink-muted)]">
          Notes and linguistic information will appear here.
        </p>
        <button
          type="button"
          onClick={() => onToggleTranslations(!showTranslations)}
          className="focus-kb text-metadata text-[var(--ink-secondary)] underline-offset-2 hover:underline"
        >
          {showTranslations ? "Hide sentence translations" : "Show sentence translations"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <header>
        <p className="break-russian font-reader text-[clamp(1.75rem,4vw,1.875rem)] leading-none text-[var(--ink)]">{panel.displayForm}</p>
        {panel.lemma && panel.lemma !== panel.displayForm ? (
          <p className="break-russian mt-2 font-reader text-[clamp(1.125rem,2.5vw,1.25rem)] text-[var(--ink-secondary)]">{panel.lemma}</p>
        ) : null}
        {panel.headerProperties.length > 0 ? (
          <MetadataLine className="mt-3" items={panel.headerProperties} />
        ) : null}
      </header>

      {panel.usage ? <MarginNote kind="usage">{panel.usage}</MarginNote> : null}

      {panel.grammar.length > 0 ? (
        <AnnotationSection title="Grammar">
          <dl className="space-y-[var(--space-3)]">
            {panel.grammar.map((row) => (
              <div key={`${row.label}-${row.value}`}>
                <dt className="text-metadata text-[var(--ink-muted)]">{row.label}</dt>
                <dd className="mt-0.5 text-sm text-[var(--ink)]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </AnnotationSection>
      ) : null}

      {panel.translation ? (
        <AnnotationSection title="Translation">
          <p className="font-reader text-base leading-relaxed text-[var(--ink)]">
            {panel.translation.primary.join(" · ")}
          </p>
          {panel.translation.secondary.length > 0 ? (
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-secondary)]">
              {panel.translation.secondary.join(" · ")}
            </p>
          ) : null}
        </AnnotationSection>
      ) : null}

      {panel.relations.length > 0 ? (
        <AnnotationSection title="Relations">
          <ul className="space-y-1.5">
            {panel.relations.map((relation) => (
              <li key={relation.href}>
                <Link
                  href={relation.href}
                  className="focus-kb font-reader text-sm text-[var(--ink)] underline-offset-2 hover:text-[var(--color-link)] hover:underline"
                >
                  {relation.label}
                </Link>
              </li>
            ))}
          </ul>
        </AnnotationSection>
      ) : null}

      {panel.lessons.length > 0 ? (
        <AnnotationSection title="Lessons">
          <ul className="space-y-1.5">
            {panel.lessons.map((lesson) => (
              <li key={lesson.href}>
                <Reference href={lesson.href}>{lesson.title}</Reference>
              </li>
            ))}
          </ul>
        </AnnotationSection>
      ) : null}

      <div className="space-y-2 border-t border-[var(--hairline)] pt-[var(--space-3)] text-metadata">
        {panel.explorerHref ? (
          <p>
            <Reference href={panel.explorerHref}>Open in Explorer →</Reference>
          </p>
        ) : null}
        {panel.practiceHref ? (
          <p>
            <Reference href={panel.practiceHref}>Practice →</Reference>
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onToggleTranslations(!showTranslations)}
        className="focus-kb text-metadata text-[var(--ink-muted)] underline-offset-2 hover:underline"
      >
        {showTranslations ? "Hide sentence translations" : "Show sentence translations"}
      </button>
    </div>
  );
}
