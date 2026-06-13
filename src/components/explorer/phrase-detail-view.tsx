import Link from "next/link";

import { PHRASE_GROUP_TYPE_LABELS } from "@/types/domain";
import type { PhraseKnowledge } from "@/types/knowledge-graph";

import { ExplorerLayout } from "./explorer-layout";
import {
  conceptChip,
  RelatedNavigation,
  textChip,
} from "./related-navigation";

type PhraseDetailViewProps = {
  knowledge: PhraseKnowledge;
  categoryLabel: string;
  categoryHref: string;
};

export function PhraseDetailView({
  knowledge,
  categoryLabel,
  categoryHref,
}: PhraseDetailViewProps) {
  const related = [
    ...knowledge.concepts.map((c) => conceptChip(c.conceptKey, c.title)),
    ...knowledge.relatedTexts.slice(0, 4).map((t) => textChip(t.textId, t.textTitle)),
  ];

  return (
    <ExplorerLayout
      breadcrumb={[{ label: categoryLabel, href: categoryHref }, { label: knowledge.label }]}
      title={knowledge.label}
      subtitle={`${PHRASE_GROUP_TYPE_LABELS[knowledge.type]} · ${knowledge.occurrenceCount}× · ${knowledge.seenInTexts} texte${knowledge.seenInTexts > 1 ? "s" : ""}`}
    >
      <div className="grid min-w-0 gap-[var(--layout-gap)] lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
        <div className="min-w-0 space-y-8">
          {knowledge.canonicalExplanation ? (
            <section className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Explication
              </h2>
              <p className="font-reader text-lg leading-relaxed">{knowledge.canonicalExplanation}</p>
            </section>
          ) : null}

          {knowledge.exampleSentences.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Exemples
              </h2>
              <ul className="space-y-2">
                {knowledge.exampleSentences.map((s) => (
                  <li
                    key={s}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-reader"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {knowledge.relatedTexts.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Textes
              </h2>
              <ul className="space-y-2">
                {knowledge.relatedTexts.map((t) => (
                  <li key={t.textId}>
                    <Link
                      href={`/texts/${t.textId}`}
                      className="focus-kb card-hover block rounded-xl border border-[var(--border)] p-4 transition"
                    >
                      <p className="text-xs text-[var(--accent-violet-bright)]">{t.textTitle}</p>
                      <p className="mt-1 font-reader text-sm">{t.sentenceRussian}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-6">
          {knowledge.concepts.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Concepts liés
              </h2>
              <div className="flex flex-wrap gap-2">
                {knowledge.concepts.map((c) => (
                  <Link
                    key={c.id}
                    href={`/explorer/concepts/${encodeURIComponent(c.conceptKey)}`}
                    className="focus-kb card-hover rounded-full border border-[var(--border)] px-3 py-1 text-sm"
                  >
                    {c.title}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
          <RelatedNavigation items={related} />
        </aside>
      </div>
    </ExplorerLayout>
  );
}
