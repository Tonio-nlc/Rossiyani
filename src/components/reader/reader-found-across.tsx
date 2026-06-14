"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

type CollapsibleSectionProps = {
  label: string;
  children: ReactNode;
};

function CollapsibleSection({ label, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="border-t border-[var(--hairline)] pt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline"
      >
        {open ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}

type ReaderFoundAcrossProps = {
  explorerHref: string | null;
  practiceHref: string;
  textCount: number;
  lessonHref: string | null;
  lessonTitle: string | null;
};

function FoundRow({
  icon,
  title,
  body,
  href,
}: {
  icon: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="focus-kb group block py-2 transition hover:text-[var(--color-link)]"
    >
      <p className="text-sm text-[var(--ink)]">
        <span aria-hidden>{icon}</span>{" "}
        <span className="font-medium">{title}</span>
      </p>
      <p className="mt-0.5 text-xs text-[var(--ink-muted)] group-hover:text-[var(--ink-secondary)]">
        {body}
      </p>
    </Link>
  );
}

export function ReaderFoundAcross({
  explorerHref,
  practiceHref,
  textCount,
  lessonHref,
  lessonTitle,
}: ReaderFoundAcrossProps) {
  const items = [
    textCount > 0
      ? {
          icon: "📖",
          title: "Reader",
          body: `Appears in ${textCount} text${textCount > 1 ? "s" : ""}`,
          href: explorerHref ?? practiceHref,
        }
      : null,
    explorerHref
      ? {
          icon: "🧭",
          title: "Explorer",
          body: "Related constructions",
          href: explorerHref,
        }
      : null,
    {
      icon: "✍",
      title: "Practice",
      body: "Generate your own sentence",
      href: practiceHref,
    },
    lessonHref && lessonTitle
      ? {
          icon: "📚",
          title: "Manual",
          body: lessonTitle,
          href: lessonHref,
        }
      : null,
  ].filter(Boolean) as Array<{
    icon: string;
    title: string;
    body: string;
    href: string;
  }>;

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-1 border-t border-[var(--hairline)] pt-4">
      <p className="home-section-label">Found across Rossiyani</p>
      <div className="mt-2 divide-y divide-[var(--hairline)]">
        {items.map((item) => (
          <FoundRow key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}

export { CollapsibleSection };
