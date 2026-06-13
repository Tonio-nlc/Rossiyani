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
  kind: string;
};

type RelatedNavigationProps = {
  items: RelatedChip[];
};

export function RelatedNavigation({ items }: RelatedNavigationProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Explorer aussi
      </h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={`${item.kind}-${item.href}`}
            href={item.href}
            className="focus-kb card-hover rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm transition hover:border-[var(--border-strong)]"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--accent-cyan)]">
              {item.kind}
            </span>
            <span className="ml-2 font-reader text-[var(--foreground)]">{item.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function conceptChip(conceptKey: string, title: string): RelatedChip {
  return { kind: "Concept", label: title, href: conceptPath(conceptKey) };
}

export function lemmaChip(lemma: string, pos: string): RelatedChip {
  return { kind: "Lemme", label: lemma, href: lemmaPath(lemma, pos) };
}

export function endingChip(ending: string, caseKey?: string | null): RelatedChip {
  return { kind: "Terminaison", label: `-${ending}`, href: endingPath(ending, caseKey) };
}

export function caseChip(caseKey: string, title: string): RelatedChip {
  return { kind: "Cas", label: title, href: casePath(caseKey) };
}

export function expressionChip(label: string): RelatedChip {
  return { kind: "Expression", label, href: expressionPath(label) };
}

export function collocationChip(label: string): RelatedChip {
  return { kind: "Collocation", label, href: collocationPath(label) };
}

export function textChip(textId: string, title: string): RelatedChip {
  return { kind: "Texte", label: title, href: textPath(textId) };
}

export function lessonChip(slug: string, title: string): RelatedChip {
  return { kind: "Leçon", label: title, href: `/manual/lecons/${slug}` };
}
