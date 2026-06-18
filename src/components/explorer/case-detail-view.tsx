import Link from "next/link";

import { CASE_LEGEND_ENTRIES } from "@/features/grammar/case-legend-data";
import type { CaseGraph } from "@/types/knowledge-graph";
import { tutorWhyFromCase } from "@/lib/explorer/tutor-copy";

import { ExplorerLayout } from "./explorer-layout";
import {
  ExplorerTutorAction,
  ExplorerTutorAdvanced,
  ExplorerTutorAdvancedSection,
  ExplorerTutorExample,
  ExplorerTutorExplanation,
  ExplorerTutorMetaLine,
  ExplorerTutorTitle,
  ExplorerTutorWhy,
} from "./explorer-tutor-sections";
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
  const legend = CASE_LEGEND_ENTRIES.find((entry) => entry.key === graph.caseNode.caseKey);
  const primaryLemma = graph.lemmas[0];
  const exampleRussian = legend?.examples[0] ?? null;
  const explanation =
    graph.caseNode.canonicalExplanation ?? legend?.frenchContrast ?? "";

  const related = [
    ...(graph.caseNode.concept
      ? [conceptChip(graph.caseNode.concept.conceptKey, graph.caseNode.concept.title)]
      : []),
    ...graph.endings.slice(0, 8).map((ending) => endingChip(ending.ending, ending.caseKey)),
    ...graph.lemmas.slice(0, 6).map((lemma) => lemmaChip(lemma.lemma, lemma.partOfSpeech)),
  ];

  return (
    <ExplorerLayout
      breadcrumb={[{ label: "Cas", href: "/explorer/cases" }, { label: graph.caseNode.titleFr }]}
    >
      <article className="space-y-10 pb-12">
        <ExplorerTutorTitle
          label={graph.caseNode.titleFr}
          translation={legend?.question ?? graph.caseNode.caseKey}
        />

        <ExplorerTutorWhy
          text={tutorWhyFromCase(graph.caseNode.titleFr, legend?.frenchContrast ?? null)}
        />

        {exampleRussian ? (
          <ExplorerTutorExample russian={exampleRussian} />
        ) : null}

        <ExplorerTutorExplanation text={explanation} />

        <ExplorerTutorAction
          primary={{
            label: primaryLemma ? `Explorer ${primaryLemma.lemma}` : "Explorer un lemme",
            href: primaryLemma
              ? lemmaPath(primaryLemma.lemma, primaryLemma.partOfSpeech)
              : `/explorer/cases/${encodeURIComponent(graph.caseNode.caseKey)}`,
            description: primaryLemma
              ? `Voir comment le ${graph.caseNode.titleFr.toLowerCase()} apparaît sur un mot concret.`
              : "Parcourez les lemmes associés à ce cas.",
          }}
        />

        <ExplorerTutorAdvanced>
          <ExplorerTutorAdvancedSection label="Statistiques">
            <ExplorerTutorMetaLine>
              {graph.stats.endingCount} terminaisons · {graph.stats.formCount} formes ·{" "}
              {graph.stats.occurrenceCount.toLocaleString("fr-FR")} occurrences
            </ExplorerTutorMetaLine>
          </ExplorerTutorAdvancedSection>

          {legend && legend.examples.length > 1 ? (
            <ExplorerTutorAdvancedSection label="Autres exemples">
              <div className="flex flex-wrap gap-2">
                {legend.examples.slice(1).map((example) => (
                  <span
                    key={example}
                    className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1.5 font-reader text-sm"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </ExplorerTutorAdvancedSection>
          ) : null}

          <ExplorerTutorAdvancedSection label="Terminaisons typiques">
            <div className="flex flex-wrap gap-2">
              {graph.endings.map((ending) => (
                <Link
                  key={ending.id}
                  href={endingPath(ending.ending, ending.caseKey)}
                  className="focus-kb rounded-lg border border-[var(--hairline)] bg-[var(--surface)] px-3 py-2 font-reader transition hover:border-[var(--ink-muted)]"
                >
                  -{ending.ending}
                  <span className="ml-2 text-xs text-[var(--ink-muted)]">{ending.hitCount}×</span>
                </Link>
              ))}
            </div>
          </ExplorerTutorAdvancedSection>

          <ExplorerTutorAdvancedSection label="Lemmes">
            <div className="flex flex-wrap gap-2">
              {graph.lemmas.slice(0, 24).map((lemma) => (
                <Link
                  key={lemma.id}
                  href={lemmaPath(lemma.lemma, lemma.partOfSpeech)}
                  className="focus-kb rounded-lg border border-[var(--hairline)] px-3 py-1.5 font-reader text-sm transition hover:border-[var(--ink-muted)]"
                >
                  {lemma.lemma}
                </Link>
              ))}
            </div>
          </ExplorerTutorAdvancedSection>

          <RelatedNavigation items={related} />
        </ExplorerTutorAdvanced>
      </article>
    </ExplorerLayout>
  );
}
