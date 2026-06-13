import Link from "next/link";

import { CASE_LEGEND_ENTRIES } from "@/features/grammar/case-legend-data";
import type { CaseGraph } from "@/types/knowledge-graph";

import { ExplorerLayout } from "./explorer-layout";
import {
  conceptChip,
  endingChip,
  lemmaChip,
  RelatedNavigation,
} from "./related-navigation";
import { endingPath, lemmaPath } from "./explorer-routes";

type CaseDetailViewProps = {
  graph: CaseGraph;
};

export function CaseDetailView({ graph }: CaseDetailViewProps) {
  const legend = CASE_LEGEND_ENTRIES.find((e) => e.key === graph.caseNode.caseKey);

  const related = [
    ...(graph.caseNode.concept
      ? [conceptChip(graph.caseNode.concept.conceptKey, graph.caseNode.concept.title)]
      : []),
    ...graph.endings.slice(0, 8).map((e) => endingChip(e.ending, e.caseKey)),
    ...graph.lemmas.slice(0, 6).map((l) => lemmaChip(l.lemma, l.partOfSpeech)),
  ];

  return (
    <ExplorerLayout
      breadcrumb={[{ label: "Cas", href: "/explorer/cases" }, { label: graph.caseNode.titleFr }]}
      title={graph.caseNode.titleFr}
      subtitle={legend?.question ?? graph.caseNode.caseKey}
    >
      <div className="grid min-w-0 gap-[var(--layout-gap)] lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
        <div className="min-w-0 space-y-8">
          {(graph.caseNode.canonicalExplanation || legend?.frenchContrast) && (
            <section className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Explication
              </h2>
              <p className="text-sm leading-relaxed">
                {graph.caseNode.canonicalExplanation ?? legend?.frenchContrast}
              </p>
            </section>
          )}

          {legend ? (
            <section className="surface-elevated rounded-2xl border border-[var(--border)] p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Français ↔ Russe
              </h2>
              <p className="mt-3 text-sm leading-relaxed">{legend.frenchContrast}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {legend.examples.map((ex) => (
                  <span
                    key={ex}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1 font-reader text-sm"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Terminaisons typiques ({graph.endings.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {graph.endings.map((e) => (
                <Link
                  key={e.id}
                  href={endingPath(e.ending, e.caseKey)}
                  className="focus-kb card-hover rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-reader transition"
                >
                  -{e.ending}
                  <span className="ml-2 text-xs text-[var(--muted)]">{e.hitCount}×</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Lemmes ({graph.lemmas.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {graph.lemmas.slice(0, 24).map((l) => (
                <Link
                  key={l.id}
                  href={lemmaPath(l.lemma, l.partOfSpeech)}
                  className="focus-kb card-hover rounded-lg border border-[var(--border)] px-3 py-1.5 font-reader text-sm transition"
                >
                  {l.lemma}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-6">
          <div className="surface-elevated rounded-2xl border border-[var(--border)] p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Terminaisons</dt>
                <dd>{graph.stats.endingCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Formes</dt>
                <dd>{graph.stats.formCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Occurrences</dt>
                <dd>{graph.stats.occurrenceCount}</dd>
              </div>
            </dl>
          </div>
          <RelatedNavigation items={related} />
        </aside>
      </div>
    </ExplorerLayout>
  );
}
