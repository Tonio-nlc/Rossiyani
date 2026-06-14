import Link from "next/link";

import {
  casePath,
  collocationPath,
  conceptPath,
  endingPath,
  expressionPath,
  lemmaPath,
  textPath,
} from "./explorer-routes";

type RelatedChip = {
  label: string;
  href: string;
  kind?: string;
};

type RelatedNavigationProps = {
  items: RelatedChip[];
  title?: string;
};

export function RelatedNavigation({ items, title = "Related" }: RelatedNavigationProps) {
  if (items.length === 0) {
    return null;
  }

  const unique = items.filter(
    (item, index, array) => array.findIndex((candidate) => candidate.href === item.href) === index,
  );

  return (
    <section className="space-y-4 pt-4">
      <p className="home-section-label">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {unique.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="focus-kb group flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-4 transition hover:border-[var(--ink-muted)]"
          >
            <span className="break-russian font-reader text-base text-[var(--ink)] group-hover:text-[var(--color-link)]">
              {item.label}
            </span>
            <span className="mt-3 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function conceptChip(conceptKey: string, title: string): RelatedChip {
  return { label: title, href: conceptPath(conceptKey) };
}

export function lemmaChip(lemma: string, pos: string): RelatedChip {
  return { label: lemma, href: lemmaPath(lemma, pos) };
}

export function endingChip(ending: string, caseKey?: string | null): RelatedChip {
  return { label: `-${ending}`, href: endingPath(ending, caseKey) };
}

export function caseChip(caseKey: string, title: string): RelatedChip {
  return { label: title, href: casePath(caseKey) };
}

export function expressionChip(label: string): RelatedChip {
  return { label, href: expressionPath(label) };
}

export function collocationChip(label: string): RelatedChip {
  return { label, href: collocationPath(label) };
}

export function textChip(textId: string, title: string): RelatedChip {
  return { label: title, href: textPath(textId) };
}

export function lessonChip(slug: string, title: string): RelatedChip {
  return { label: title, href: `/manual/lecons/${slug}` };
}
