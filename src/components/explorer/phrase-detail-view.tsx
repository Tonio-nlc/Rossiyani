import type { PhraseKnowledge } from "@/types/knowledge-graph";

import { ExplorerCompactList } from "./explorer-compact-list";

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
    <div className="explorer-workspace-pane explorer-workspace-pane--detail">
      <article className="explorer-word">
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
          <section className="explorer-word-section explorer-word-section--archive">
            <h2 className="explorer-word-section__title explorer-word-section__title--subtle">
              Textes
            </h2>
            <ExplorerCompactList
              items={knowledge.relatedTexts.map((t) => ({
                label: t.textTitle,
                href: `/texts/${t.textId}`,
                subtitle: t.sentenceRussian,
              }))}
            />
          </section>
        ) : null}

        <RelatedNavigation items={related} title="Liens" />
      </article>
    </div>
  );
}
