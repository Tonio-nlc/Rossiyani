"use client";

import Link from "next/link";

type ReaderFoundAcrossProps = {
  lessonHref: string | null;
  lessonTitle: string | null;
  textCount: number;
  readHref: string | null;
  practiceHref: string;
};

export function ReaderFoundAcross({
  lessonHref,
  lessonTitle,
  textCount,
  readHref,
  practiceHref,
}: ReaderFoundAcrossProps) {
  const cards = [
    lessonHref && lessonTitle
      ? {
          icon: "📖",
          title: "Manual",
          body: "Related lesson available",
          href: lessonHref,
          cta: "Open →",
        }
      : null,
    textCount > 0 && readHref
      ? {
          icon: "📚",
          title: "Reader",
          body: `Appears in ${textCount} text${textCount > 1 ? "s" : ""}`,
          href: readHref,
          cta: "Read →",
        }
      : null,
    {
      icon: "✍",
      title: "Practice",
      body: "Generate your own example",
      href: practiceHref,
      cta: "Practice →",
    },
  ].filter(Boolean) as Array<{
    icon: string;
    title: string;
    body: string;
    href: string;
    cta: string;
  }>;

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <p className="home-section-label">Found across Rossiyani</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="focus-kb group flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-4 transition hover:border-[var(--ink-muted)]"
          >
            <span className="text-xl" aria-hidden>
              {card.icon}
            </span>
            <p className="mt-3 text-sm font-medium text-[var(--ink)]">{card.title}</p>
            <p className="mt-1 text-sm text-[var(--ink-secondary)]">{card.body}</p>
            <span className="mt-auto pt-4 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
              {card.cta}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
