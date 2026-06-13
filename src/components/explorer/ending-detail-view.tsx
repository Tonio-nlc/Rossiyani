import Link from "next/link";

import { EndingBadge } from "@/components/analysis/ending-badge";
import { getCaseLegendEntry } from "@/features/grammar/case-legend-data";
import type { CaseKey } from "@/features/grammar";
import { pickCanonicalExplanation } from "@/services/knowledge-graph/graph-mappers";
import type { EndingGraph } from "@/types/knowledge-graph";

import { ExplorerLayout } from "./explorer-layout";
import {
  caseChip,
  conceptChip,
  lemmaChip,
  RelatedNavigation,
} from "./related-navigation";
import { lemmaPath } from "./explorer-routes";

type EndingDetailViewProps = {
  graph: EndingGraph;
};

export function EndingDetailView({ graph }: EndingDetailViewProps) {
  const { ending, forms, lemmas, concepts, occurrences } = graph;
  const legend = getCaseLegendEntry(ending.caseKey as CaseKey);
  const explanation = pickCanonicalExplanation(ending.canonicalExplanation, ending.explanationFr);

  const exampleSentences = [
    ...new Set(
      occurrences
        .map((o) => o.sentenceRussian)
        .filter(Boolean)
        .slice(0, 8),
    ),
  ];

  const formLemmaMap = new Map<string, string>();
  for (const form of forms) {
    const match = lemmas.find((l) => form.original.startsWith(l.lemma) || form.original.includes(l.lemma));
    if (match) {
      formLemmaMap.set(form.id, match.lemma);
    }
  }

  const related = [
    ...concepts.map((c) => conceptChip(c.conceptKey, c.title)),
    ...(legend ? [caseChip(ending.caseKey, legend.frenchName)] : []),
    ...lemmas.slice(0, 6).map((l) => lemmaChip(l.lemma, l.partOfSpeech)),
  ];

  return (
    <ExplorerLayout
      breadcrumb={[
        { label: "Terminaisons", href: "/explorer/endings" },
        { label: `-${ending.ending}` },
      ]}
      title=""
      subtitle={legend ? `${legend.frenchName} · ${legend.question}` : ending.caseKey}
    >
      <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-fade-up">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Terminaison
          </p>
          <div className="mt-3">
            <EndingBadge
              endingText={`-${ending.ending}`}
              grammaticalCase={ending.caseKey}
              size="hero"
            />
          </div>
        </div>
        <p className="text-sm text-[var(--muted)]">
          {ending.hitCount.toLocaleString("fr-FR")} occurrences dans le graphe
        </p>
      </div>

      <div className="grid min-w-0 gap-[var(--layout-gap)] lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
        <div className="min-w-0 space-y-8">
          {explanation ? (
            <section className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Explication
              </h2>
              <p className="text-sm leading-relaxed">{explanation}</p>
            </section>
          ) : null}

          {legend ? (
            <section className="surface-elevated rounded-2xl border border-[var(--border)] p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Français ↔ Russe
              </h2>
              <p className="mt-3 text-sm leading-relaxed">{legend.frenchContrast}</p>
            </section>
          ) : null}

          <section className="space-y-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Mots avec cette terminaison ({forms.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {forms.map((f) => {
                const lemma = formLemmaMap.get(f.id);
                const inner = (
                  <span className="font-reader">{f.original}</span>
                );
                return lemma ? (
                  <Link
                    key={f.id}
                    href={lemmaPath(lemma, "noun")}
                    className="focus-kb card-hover rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 transition"
                  >
                    {inner}
                  </Link>
                ) : (
                  <span
                    key={f.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-reader"
                  >
                    {f.original}
                  </span>
                );
              })}
            </div>
          </section>

          {exampleSentences.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Exemples
              </h2>
              <ul className="space-y-2">
                {exampleSentences.map((s) => (
                  <li
                    key={s}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-reader text-sm"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-6">
          <Link
            href={`/explorer/cases/${encodeURIComponent(ending.caseKey)}`}
            className="focus-kb card-hover block rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 transition"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Cas associé
            </p>
            <p className="mt-2 font-medium">{legend?.frenchName ?? ending.caseKey}</p>
            {legend ? <p className="mt-1 text-xs text-[var(--muted)]">{legend.question}</p> : null}
          </Link>

          <RelatedNavigation items={related} />
        </aside>
      </div>
    </ExplorerLayout>
  );
}
