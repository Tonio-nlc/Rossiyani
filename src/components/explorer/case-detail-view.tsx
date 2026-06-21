import Link from "next/link";

import { CASE_LEGEND_ENTRIES } from "@/features/grammar/case-legend-data";
import type { CaseGraph } from "@/types/knowledge-graph";
import { groupOccurrencesByText, pickShortSentences } from "@/lib/explorer/explorer-ia";

import { ExplorerLemmaCardGrid, ExplorerTextCardGrid } from "./explorer-card-grid";
import { ExplorerEntityHeader } from "./explorer-entity-header";
import { ExplorerExampleList } from "./explorer-example-list";
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
    hint: "Seen in this case",
  }));

  return (
    <div className="explorer-workspace-pane explorer-workspace-pane--detail">
      <article className="explorer-word explorer-word--detail">
        <ExplorerEntityHeader
          breadcrumb={[
            { label: "Explorer", href: "/explorer" },
            { label: "Cases", href: "/explorer/cases" },
            { label: graph.caseNode.titleFr },
          ]}
          title={graph.caseNode.titleFr}
          subtitle={legend?.question ?? "Russian grammatical case"}
          badges={<span className="explorer-word__badge explorer-word__badge--accent">Case</span>}
        />

        {legend ? (
          <ExplorerSection title="Question" icon="question" lead="How to spot this case">
            <p className="explorer-word-section__prose">{legend.question}</p>
          </ExplorerSection>
        ) : null}

        <ExplorerSection title="Function" icon="function" lead="The role it plays in a sentence">
          <p className="explorer-word-section__prose">
            {caseFunction(graph.caseNode.caseKey) || graph.caseNode.canonicalExplanation}
          </p>
        </ExplorerSection>

        {examples.length > 0 ? (
          <ExplorerSection title="Examples" icon="examples" lead="Forms you may recognize">
            <ExplorerExampleList examples={examples} />
          </ExplorerSection>
        ) : null}

        {linkedTexts.length > 0 ? (
          <ExplorerSection title="Linked texts" icon="texts" lead="Where this case appears for you">
            <ExplorerTextCardGrid items={linkedTexts} />
          </ExplorerSection>
        ) : null}

        {graph.endings.length > 0 ? (
          <ExplorerSection
            title="Common endings"
            icon="related-words"
            lead="Endings tied to this case in your texts"
          >
            <ExplorerLemmaCardGrid
              items={graph.endings.slice(0, 6).map((ending) => ({
                label: `-${ending.ending}`,
                href: endingPath(ending.ending, ending.caseKey),
                hint: "Typical ending for this case",
              }))}
            />
          </ExplorerSection>
        ) : null}

        {relatedWords.length > 0 ? (
          <ExplorerSection
            title="Related words"
            icon="related-words"
            lead="Lemmas observed in this case"
          >
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
