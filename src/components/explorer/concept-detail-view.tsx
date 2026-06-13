import Link from "next/link";

import { getCaseLegendEntry } from "@/features/grammar/case-legend-data";
import type { ConceptKnowledge } from "@/types/knowledge-graph";

import { practicePath } from "@/lib/practice/constants";

import { ExplorerLayout } from "./explorer-layout";
import {
  collocationChip,
  conceptChip,
  endingChip,
  expressionChip,
  lemmaChip,
  RelatedNavigation,
  textChip,
} from "./related-navigation";
import { endingPath, lemmaPath } from "./explorer-routes";

type ConceptDetailViewProps = {
  concept: ConceptKnowledge;
  relatedTexts: Array<{ textId: string; textTitle: string; sentenceRussian: string }>;
};

function grammaticalQuestion(concept: ConceptKnowledge): string | null {
  const caseNode = concept.cases[0];
  if (caseNode) {
    const legend = getCaseLegendEntry(caseNode.caseKey as import("@/features/grammar").CaseKey);
    return legend?.question ?? caseNode.titleFr;
  }
  if (concept.concept.category === "GRAMMATICAL_CASE") {
    return "Quelle fonction grammaticale ce concept décrit-il ?";
  }
  return null;
}

export function ConceptDetailView({ concept, relatedTexts }: ConceptDetailViewProps) {
  const question = grammaticalQuestion(concept);

  const related = [
    ...concept.endings.slice(0, 6).map((e) => endingChip(e.ending, e.caseKey)),
    ...concept.lemmas.slice(0, 6).map((l) => lemmaChip(l.lemma, l.partOfSpeech)),
    ...concept.phrases.slice(0, 4).map((p) =>
      p.type === "COLLOCATION" ? collocationChip(p.label) : expressionChip(p.label),
    ),
    ...concept.relatedConcepts.slice(0, 4).map((c) => conceptChip(c.conceptKey, c.title)),
    ...relatedTexts.slice(0, 4).map((t) => textChip(t.textId, t.textTitle)),
  ];

  return (
    <ExplorerLayout
      breadcrumb={[{ label: "Concepts", href: "/explorer/concepts" }, { label: concept.concept.title }]}
      title={concept.concept.title}
      subtitle={concept.concept.category.replace(/_/g, " ").toLowerCase()}
    >
      <div className="grid min-w-0 gap-[var(--layout-gap)] lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
        <div className="min-w-0 space-y-8">
          {question ? (
            <section className="surface-elevated rounded-2xl border border-[var(--border)] p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-violet-bright)]">
                Question grammaticale
              </h2>
              <p className="mt-3 font-reader text-xl text-[var(--foreground)]">{question}</p>
            </section>
          ) : null}

          <section className="space-y-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Explication
            </h2>
            <p className="text-sm leading-relaxed text-[var(--foreground)]">
              {concept.concept.canonicalExplanation}
            </p>
          </section>

          {concept.concept.frenchComparison ? (
            <section className="surface-elevated rounded-2xl border border-[var(--border)] p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Français ↔ Russe
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]">
                {concept.concept.frenchComparison}
              </p>
            </section>
          ) : null}

          {concept.endings.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Terminaisons associées
              </h2>
              <div className="flex flex-wrap gap-2">
                {concept.endings.map((e) => (
                  <Link
                    key={e.id}
                    href={endingPath(e.ending, e.caseKey)}
                    className="focus-kb card-hover rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-reader text-sm transition hover:border-[var(--accent-violet)]"
                  >
                    -{e.ending}
                    <span className="ml-2 text-xs text-[var(--muted)]">{e.caseKey}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {concept.lemmas.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Exemples (lemmes)
              </h2>
              <div className="flex flex-wrap gap-2">
                {concept.lemmas.slice(0, 12).map((l) => (
                  <Link
                    key={l.id}
                    href={lemmaPath(l.lemma, l.partOfSpeech)}
                    className="focus-kb card-hover rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-reader transition hover:border-[var(--accent-cyan)]"
                  >
                    {l.lemma}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {relatedTexts.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Textes liés
              </h2>
              <ul className="space-y-2">
                {relatedTexts.map((t) => (
                  <li key={`${t.textId}-${t.sentenceRussian.slice(0, 20)}`}>
                    <Link
                      href={`/texts/${t.textId}`}
                      className="focus-kb card-hover block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--border-strong)]"
                    >
                      <p className="text-xs font-medium text-[var(--accent-violet-bright)]">
                        {t.textTitle}
                      </p>
                      <p className="mt-1 font-reader text-sm text-[var(--foreground)]">
                        {t.sentenceRussian}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-6">
          <div className="surface-elevated rounded-2xl border border-[var(--border)] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Statistiques
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Lemmes</dt>
                <dd>{concept.stats.lemmaCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Terminaisons</dt>
                <dd>{concept.stats.endingCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Occurrences</dt>
                <dd>{concept.concept.hitCount}</dd>
              </div>
            </dl>
          </div>

          {concept.cases.map((c) => (
            <Link
              key={c.id}
              href={`/explorer/cases/${c.caseKey}`}
              className="focus-kb card-hover block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition"
            >
              <p className="text-xs text-[var(--muted)]">Cas lié</p>
              <p className="mt-1 font-medium">{c.titleFr}</p>
            </Link>
          ))}

          <div className="border-t border-[var(--border)] pt-4">
            <Link
              href={practicePath({
                structure: concept.concept.title,
                mode: "structure",
                from: "explorer",
              })}
              className="focus-kb text-sm font-medium text-[var(--foreground)] underline-offset-2 hover:underline"
            >
              Practice this construction →
            </Link>
          </div>

          <RelatedNavigation items={related} />
        </aside>
      </div>
    </ExplorerLayout>
  );
}
