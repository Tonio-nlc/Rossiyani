import Link from "next/link";

import { CASE_LEGEND_ENTRIES } from "@/features/grammar/case-legend-data";
import type { CaseGraph } from "@/types/knowledge-graph";
import { groupOccurrencesByText, observedInContexts, pickShortSentences } from "@/lib/explorer/explorer-ia";

import { ExplorerLemmaCardGrid, ExplorerTextCardGrid } from "./explorer-card-grid";
import { ExplorerSection } from "./explorer-section";
import { endingPath, lemmaPath } from "./explorer-routes";

type CaseDetailViewProps = {
  graph: CaseGraph;
};

function caseFunction(caseKey: string): string {
  const legend = CASE_LEGEND_ENTRIES.find((entry) => entry.key === caseKey);
  if (!legend) {
    return "";
  }
  return legend.question
    .replace(/^Qui \? Quoi \? \(sujet\)$/i, "Subject of the action.")
    .replace(/^Qui \? Quoi \? \(complément\)$/i, "Direct object of the verb.")
    .replace(/\s*\(.*\)\s*$/, "")
    .trim();
}

export function CaseDetailView({ graph }: CaseDetailViewProps) {
  const legend = CASE_LEGEND_ENTRIES.find((entry) => entry.key === graph.caseNode.caseKey);
  const examples = pickShortSentences(
    [
      ...(legend?.examples ?? []),
      ...graph.occurrences.map((occurrence) => occurrence.sentenceRussian),
    ],
    5,
  );
  const linkedTexts = groupOccurrencesByText(graph.occurrences);
  const relatedWords = graph.lemmas.slice(0, 6).map((lemma) => ({
    label: lemma.lemma,
    href: lemmaPath(lemma.lemma, lemma.partOfSpeech),
  }));

  return (
    <div className="explorer-workspace-pane explorer-workspace-pane--detail">
      <article className="explorer-word">
        <header className="explorer-word__hero">
          <h1 className="explorer-word__lemma">{graph.caseNode.titleFr}</h1>
        </header>

        {legend ? (
          <ExplorerSection title="Question">
            <p className="explorer-word-section__prose">{legend.question}</p>
          </ExplorerSection>
        ) : null}

        <ExplorerSection title="Function">
          <p className="explorer-word-section__prose">
            {caseFunction(graph.caseNode.caseKey) || graph.caseNode.canonicalExplanation}
          </p>
        </ExplorerSection>

        {examples.length > 0 ? (
          <ExplorerSection title="Examples">
            <ul className="explorer-word-example-list">
              {examples.map((example) => (
                <li key={example} className="explorer-word-example">
                  <p className="explorer-word-example__russian break-russian font-reader">
                    {example}
                  </p>
                </li>
              ))}
            </ul>
          </ExplorerSection>
        ) : null}

        {linkedTexts.length > 0 ? (
          <ExplorerSection title="Linked texts">
            <ExplorerTextCardGrid items={linkedTexts} />
          </ExplorerSection>
        ) : null}

        {graph.endings.length > 0 ? (
          <ExplorerSection title="Common endings">
            <ExplorerLemmaCardGrid
              items={graph.endings.slice(0, 6).map((ending) => ({
                label: `-${ending.ending}`,
                href: endingPath(ending.ending, ending.caseKey),
                meta: observedInContexts(ending.hitCount),
              }))}
            />
          </ExplorerSection>
        ) : null}

        {relatedWords.length > 0 ? (
          <ExplorerSection title="Related words">
            <ExplorerLemmaCardGrid items={relatedWords} />
          </ExplorerSection>
        ) : null}

        <section className="explorer-manual-bridge">
          <p className="explorer-manual-bridge__text">
            For structured teaching on this case, use the Manual.
          </p>
          <Link
            href={`/manual/curriculum/${graph.caseNode.caseKey}`}
            className="explorer-manual-bridge__link focus-kb"
          >
            Open in Manual →
          </Link>
        </section>
      </article>
    </div>
  );
}
