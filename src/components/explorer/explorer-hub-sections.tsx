import Link from "next/link";

import type { TextListItem } from "@/features/texts";
import { formatStat } from "@/components/library/library-utils";
import type { KnowledgeMetricsSnapshot } from "@/types/import-pipeline";

import { BrowseList } from "./browse-list";
import { conceptPath, lemmaPath, textPath } from "./explorer-routes";

type ExplorerTopSectionProps = {
  metrics: KnowledgeMetricsSnapshot;
};

export function ExplorerTopSection({ metrics }: ExplorerTopSectionProps) {
  const topLemmas = metrics.topLemmas.slice(0, 8).map((item) => ({
    label: item.lemma,
    href: lemmaPath(item.lemma, "noun"),
    meta: `${formatStat(item.occurrenceCount)}×`,
  }));

  const topConcepts = metrics.topConcepts.slice(0, 8).map((item) => ({
    label: item.title,
    href: conceptPath(item.title),
    meta: `${formatStat(item.hitCount)}×`,
  }));

  return (
    <section className="space-y-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Les plus fréquents
      </h2>
      <div className="grid gap-8 lg:grid-cols-2">
      <BrowseList title="Lemmes les plus fréquents" items={topLemmas} />
      <BrowseList title="Concepts les plus rencontrés" items={topConcepts} />
      </div>
      <p className="text-xs text-[var(--muted)] lg:col-span-2">
        <Link href="/explorer/lemmas" className="text-[var(--accent-violet-bright)] hover:underline">
          Voir tous les lemmes
        </Link>
        {" · "}
        <Link href="/explorer/concepts" className="text-[var(--accent-violet-bright)] hover:underline">
          Voir tous les concepts
        </Link>
      </p>
    </section>
  );
}

type ExplorerTextsSectionProps = {
  texts: TextListItem[];
};

export function ExplorerTextsSection({ texts }: ExplorerTextsSectionProps) {
  const recent = [...texts]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <span aria-hidden>📖</span>
          Textes
        </h2>
        <Link
          href="/library"
          className="focus-kb text-xs font-medium text-[var(--accent-violet-bright)] hover:underline"
        >
          Bibliothèque ({formatStat(texts.length)})
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-6 text-sm text-[var(--muted)]">
          Aucun texte importé.{" "}
          <Link href="/import" className="text-[var(--accent-violet-bright)] hover:underline">
            Importer un texte
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          {recent.map((text) => (
            <li key={text.id}>
              <Link
                href={textPath(text.id)}
                className="focus-kb flex items-center justify-between gap-4 px-4 py-3 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-[var(--surface-elevated)]"
              >
                <span className="font-reader font-medium text-[var(--foreground)]">{text.title}</span>
                <span className="shrink-0 text-xs text-[var(--muted)]">
                  {text.level} · {text.sentenceCount} ph.
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type ExplorerStatsSectionProps = {
  metrics: KnowledgeMetricsSnapshot;
  textCount: number;
};

export function ExplorerStatsSection({ metrics, textCount }: ExplorerStatsSectionProps) {
  const stats = [
    { label: "Textes", value: textCount, href: "/library" },
    { label: "Lemmes", value: metrics.graphSize.lemmas, href: "/explorer/lemmas" },
    { label: "Concepts", value: metrics.graphSize.concepts, href: "/explorer/concepts" },
    { label: "Terminaisons", value: metrics.graphSize.endings, href: "/explorer/endings" },
    { label: "Collocations", value: metrics.graphSize.phrases, href: "/explorer/collocations" },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Statistiques
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="focus-kb card-hover surface-elevated animate-fade-up rounded-2xl border border-[var(--border)] p-4 shadow-[var(--shadow-soft)] transition"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {formatStat(stat.value)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{stat.label}</p>
          </Link>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">
        {formatStat(metrics.graphSize.forms)} formes · {formatStat(metrics.graphSize.phrases)} expressions
        et collocations · {formatStat(metrics.graphSize.occurrences)} occurrences
      </p>
    </section>
  );
}
