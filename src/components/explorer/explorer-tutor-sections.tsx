"use client";

import { useState, type ReactNode } from "react";

import { EditorialCard, GhostButton, PrimaryButton } from "@/components/design-system";
import { TextEditorialContext } from "@/components/editorial";
import { splitEditorialParagraphs } from "@/features/explorer/entity/types";

type ExplorerTutorTitleProps = {
  label: string;
  translation?: string | null;
};

export function ExplorerTutorTitle({ label, translation }: ExplorerTutorTitleProps) {
  return (
    <header className="editorial-page-section space-y-2 pb-0">
      <p className="break-russian font-reader text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-tight text-[var(--ink)]">
        {label}
      </p>
      {translation ? (
        <p className="font-reader text-[clamp(1.125rem,2.5vw,1.375rem)] leading-snug text-[var(--ink-secondary)]">
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
    <section className="editorial-page-section space-y-4 pb-0">
      <p className="text-eyebrow">Définition</p>
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
    <section className="editorial-page-section space-y-4 pb-0">
      <p className="text-eyebrow">Exemples</p>
      <blockquote className="max-w-2xl border-l-2 border-[var(--hairline)] pl-5">
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
          <GhostButton href={sourceHref} className="mt-4">
            {resolvedTitle} →
          </GhostButton>
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
    <section className="editorial-page-section space-y-4 pb-0">
      <p className="text-eyebrow">Usage</p>
      <div className="max-w-2xl space-y-3">
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-base leading-relaxed text-[var(--ink)]">
            {paragraph}
          </p>
        ))}
        {commonMistakes?.trim() ? (
          <div className="border border-[var(--hairline)] bg-[var(--surface-primary)] px-4 py-3">
            <p className="text-eyebrow mb-2">Erreur fréquente</p>
            <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">{commonMistakes}</p>
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
    <section className="editorial-page-section space-y-4 pb-0">
      <p className="text-eyebrow">Pratique</p>
      <EditorialCard
        href={primary.href}
        featured
        title={primary.label}
        meta={primary.description}
        footer={<PrimaryButton href={primary.href}>Commencer</PrimaryButton>}
      />
      {secondary.length > 0 ? (
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {secondary.map((link) => (
            <li key={link.href}>
              <GhostButton href={link.href}>{link.label} →</GhostButton>
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
    <section className="editorial-page-section">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="focus-kb flex w-full items-center justify-between border-t border-[var(--hairline)] pt-6 text-left"
        aria-expanded={open}
      >
        <span className="text-eyebrow">Grammaire et formes</span>
        <span className="text-sm text-[var(--ink-muted)]">{open ? "Replier" : "Voir plus"}</span>
      </button>
      {open ? <div className="mt-8 space-y-10">{children}</div> : null}
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
      <p className="text-eyebrow">{label}</p>
      {children}
    </section>
  );
}

export function ExplorerTutorMetaLine({ children }: { children: ReactNode }) {
  return <p className="text-sm text-[var(--ink-muted)]">{children}</p>;
}
