import { EditorialCard, GhostButton } from "@/components/design-system";
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
    >
      <article className="space-y-6 pb-8">
        {knowledge.canonicalExplanation ? (
          <section className="editorial-page-section space-y-3 pb-0">
            <p className="text-eyebrow">Définition</p>
            <p className="max-w-2xl font-reader text-lg leading-relaxed text-[var(--ink)]">
              {knowledge.canonicalExplanation}
            </p>
          </section>
        ) : null}

        {knowledge.exampleSentences.length > 0 ? (
          <section className="editorial-page-section space-y-3 pb-0">
            <p className="text-eyebrow">
              {knowledge.exampleSentences.length === 1 ? "Exemple" : "Exemples"}
            </p>
            <ul className="max-w-2xl space-y-3">
              {knowledge.exampleSentences.map((s) => (
                <li key={s} className="ds-microscope-panel font-reader text-[var(--ink)]">
                  {s}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {knowledge.relatedTexts.length > 0 ? (
          <section className="editorial-page-section space-y-3 pb-0">
            <p className="text-eyebrow">Textes</p>
            <div className="library-editorial-grid max-w-2xl">
              {knowledge.relatedTexts.map((t) => (
                <EditorialCard
                  key={t.textId}
                  href={`/texts/${t.textId}`}
                  title={t.textTitle}
                  subtitle={t.sentenceRussian}
                  footer={<GhostButton href={`/texts/${t.textId}`}>Lire →</GhostButton>}
                />
              ))}
            </div>
          </section>
        ) : null}

        <RelatedNavigation items={related} title="Liens" />
      </article>
    </ExplorerLayout>
  );
}
