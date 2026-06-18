"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { TextEditorialContext } from "@/components/editorial";
import { splitEditorialParagraphs } from "@/features/explorer/entity/types";

type ExplorerTutorTitleProps = {
  label: string;
  translation?: string | null;
};

export function ExplorerTutorTitle({ label, translation }: ExplorerTutorTitleProps) {
  return (
    <header className="pb-2">
      <p className="break-russian font-reader text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-tight text-[var(--ink)]">
        {label}
      </p>
      {translation ? (
        <p className="mt-2 font-reader text-[clamp(1.125rem,2.5vw,1.375rem)] leading-snug text-[var(--ink-secondary)]">
          {translation}
        </p>
      ) : null}
    </header>
  );
}

type ExplorerTutorWhyProps = {
  text: string;
};

export function ExplorerTutorWhy({ text }: ExplorerTutorWhyProps) {
  const paragraphs = splitEditorialParagraphs(text);

  return (
    <section className="space-y-4">
      <p className="home-section-label">Pourquoi apprendre ce concept ?</p>
      <div className="max-w-2xl space-y-3">
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-base leading-relaxed text-[var(--ink-secondary)]">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

type ExplorerTutorExampleProps = {
  russian: string;
  translation?: string | null;
  sourceHref?: string | null;
  /** @deprecated Use sourceTitle + sourceCollectionId */
  sourceLabel?: string | null;
  sourceTitle?: string | null;
  sourceCollectionId?: string | null;
  explanation?: string | null;
};

export function ExplorerTutorExample({
  russian,
  translation,
  sourceHref,
  sourceLabel,
  sourceTitle,
  sourceCollectionId,
  explanation,
}: ExplorerTutorExampleProps) {
  const resolvedTitle = sourceTitle ?? sourceLabel;
  const showEditorialSource = Boolean(resolvedTitle && sourceCollectionId);
  return (
    <section className="space-y-4">
      <p className="home-section-label">Exemple réel</p>
      <blockquote className="max-w-2xl border-l-2 border-[var(--ink)] pl-5">
        <p className="break-russian font-reader text-[clamp(1.125rem,2.5vw,1.375rem)] leading-snug text-[var(--ink)]">
          {russian}
        </p>
        {translation ? (
          <p className="mt-3 text-base leading-relaxed text-[var(--ink-secondary)]">{translation}</p>
        ) : null}
        {explanation ? (
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{explanation}</p>
        ) : null}
        {showEditorialSource ? (
          <div className="mt-4">
            <TextEditorialContext
              eyebrow="Exemple issu de :"
              title={resolvedTitle!}
              collectionId={sourceCollectionId!}
              href={sourceHref}
              size="sm"
            />
          </div>
        ) : sourceHref && resolvedTitle ? (
          <Link
            href={sourceHref}
            className="focus-kb mt-4 inline-block text-sm font-medium text-[var(--ink-muted)] transition hover:text-[var(--color-link)]"
          >
            {resolvedTitle} →
          </Link>
        ) : null}
      </blockquote>
    </section>
  );
}

type ExplorerTutorExplanationProps = {
  text: string;
  commonMistakes?: string | null;
};

export function ExplorerTutorExplanation({ text, commonMistakes }: ExplorerTutorExplanationProps) {
  if (!text.trim() && !commonMistakes?.trim()) {
    return null;
  }

  const paragraphs = splitEditorialParagraphs(text);

  return (
    <section className="space-y-4">
      <p className="home-section-label">Explication simple</p>
      <div className="max-w-2xl space-y-3">
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-base leading-relaxed text-[var(--ink)]">
            {paragraph}
          </p>
        ))}
        {commonMistakes?.trim() ? (
          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
              Erreur fréquente
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
              {commonMistakes}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export type ExplorerTutorActionLink = {
  label: string;
  href: string;
  description?: string;
};

type ExplorerTutorActionProps = {
  primary: ExplorerTutorActionLink;
  secondary?: ExplorerTutorActionLink[];
};

export function ExplorerTutorAction({ primary, secondary = [] }: ExplorerTutorActionProps) {
  return (
    <section className="space-y-4">
      <p className="home-section-label">Action immédiate</p>
      <Link
        href={primary.href}
        className="focus-kb group flex max-w-2xl flex-col rounded-2xl border border-[var(--ink)] bg-[var(--paper)] px-6 py-6 transition hover:bg-[var(--surface)]"
      >
        <span className="font-reader text-xl text-[var(--ink)] group-hover:text-[var(--color-link)]">
          {primary.label} →
        </span>
        {primary.description ? (
          <span className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
            {primary.description}
          </span>
        ) : null}
      </Link>
      {secondary.length > 0 ? (
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {secondary.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="focus-kb text-[var(--ink-secondary)] underline-offset-4 transition hover:text-[var(--ink)] hover:underline"
              >
                {link.label} →
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

type ExplorerTutorAdvancedProps = {
  children: ReactNode;
};

export function ExplorerTutorAdvanced({ children }: ExplorerTutorAdvancedProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="border-t border-[var(--hairline)] pt-8">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="focus-kb flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="home-section-label">Informations avancées</span>
        <span className="text-sm text-[var(--ink-muted)]">{open ? "Replier" : "Voir plus"}</span>
      </button>
      {open ? <div className="mt-8 space-y-12">{children}</div> : null}
    </section>
  );
}

export function ExplorerTutorAdvancedSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <p className="text-sm font-medium text-[var(--ink-muted)]">{label}</p>
      {children}
    </section>
  );
}

export function ExplorerTutorMetaLine({ children }: { children: ReactNode }) {
  return <p className="text-sm text-[var(--ink-muted)]">{children}</p>;
}
