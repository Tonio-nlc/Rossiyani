import { EditorialCard, GhostButton, Tag } from "@/components/design-system";
import { EndingBadge } from "@/components/analysis/ending-badge";
import { getCaseLegendEntry } from "@/features/grammar/case-legend-data";
import type { CaseKey } from "@/features/grammar";
import { tutorWhyFromEnding } from "@/lib/explorer/tutor-copy";
import { pickCanonicalExplanation } from "@/services/knowledge-graph/graph-mappers";
import type { EndingGraph } from "@/types/knowledge-graph";

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
  const endingLabel = `-${ending.ending}`;

  const exampleSentences = [
    ...new Set(
      occurrences
        .map((occurrence) => occurrence.sentenceRussian)
        .filter(Boolean)
        .slice(0, 8),
    ),
  ];

  const formLemmaMap = new Map<string, string>();
  for (const form of forms) {
    const match = lemmas.find(
      (lemma) => form.original.startsWith(lemma.lemma) || form.original.includes(lemma.lemma),
    );
    if (match) {
      formLemmaMap.set(form.id, match.lemma);
    }
  }

  const primaryLemma = lemmas[0];
  const related = [
    ...concepts.map((concept) => conceptChip(concept.conceptKey, concept.title)),
    ...(legend ? [caseChip(ending.caseKey, legend.frenchName)] : []),
    ...lemmas.slice(0, 6).map((lemma) => lemmaChip(lemma.lemma, lemma.partOfSpeech)),
  ];

  return (
    <ExplorerLayout
      breadcrumb={[
        { label: "Terminaisons", href: "/explorer/endings" },
        { label: endingLabel },
      ]}
    >
      <article className="space-y-10 pb-12">
        <header className="space-y-3">
          <EndingBadge
            endingText={endingLabel}
            grammaticalCase={ending.caseKey}
            size="hero"
          />
          <ExplorerTutorTitle
            label={endingLabel}
            translation={legend ? `${legend.frenchName} · ${legend.question}` : ending.caseKey}
          />
        </header>

        <ExplorerTutorWhy
          text={tutorWhyFromEnding(endingLabel, legend?.question ?? null)}
        />

        {exampleSentences[0] ? (
          <ExplorerTutorExample russian={exampleSentences[0]} />
        ) : legend?.examples[0] ? (
          <ExplorerTutorExample russian={legend.examples[0]} />
        ) : null}

        <ExplorerTutorExplanation
          text={[explanation, legend?.frenchContrast].filter(Boolean).join("\n\n")}
        />

        <ExplorerTutorAction
          primary={{
            label: primaryLemma ? `Explorer ${primaryLemma.lemma}` : "Voir le cas associé",
            href: primaryLemma
              ? lemmaPath(primaryLemma.lemma, primaryLemma.partOfSpeech)
              : `/explorer/cases/${encodeURIComponent(ending.caseKey)}`,
            description: "Passez du motif grammatical au mot concret dans vos textes.",
          }}
        />

        <ExplorerTutorAdvanced>
          <ExplorerTutorAdvancedSection label="Statistiques">
            <ExplorerTutorMetaLine>
              {ending.hitCount.toLocaleString("fr-FR")} occurrences · {forms.length} formes ·{" "}
              {lemmas.length} lemmes
            </ExplorerTutorMetaLine>
          </ExplorerTutorAdvancedSection>

          <ExplorerTutorAdvancedSection label="Mots avec cette terminaison">
            <div className="flex flex-wrap gap-2">
              {forms.map((form) => {
                const lemma = formLemmaMap.get(form.id);
                return lemma ? (
                  <GhostButton key={form.id} href={lemmaPath(lemma, "noun")}>
                    <span className="font-reader">{form.original}</span>
                  </GhostButton>
                ) : (
                  <Tag key={form.id}>
                    <span className="font-reader">{form.original}</span>
                  </Tag>
                );
              })}
            </div>
          </ExplorerTutorAdvancedSection>

          {exampleSentences.length > 1 ? (
            <ExplorerTutorAdvancedSection label="Autres exemples">
              <ul className="space-y-2">
                {exampleSentences.slice(1).map((sentence) => (
                  <li key={sentence} className="ds-microscope-panel font-reader text-sm text-[var(--ink)]">
                    {sentence}
                  </li>
                ))}
              </ul>
            </ExplorerTutorAdvancedSection>
          ) : null}

          <EditorialCard
            href={`/explorer/cases/${encodeURIComponent(ending.caseKey)}`}
            title={legend?.frenchName ?? ending.caseKey}
            eyebrow="Cas associé"
            footer={
              <GhostButton href={`/explorer/cases/${encodeURIComponent(ending.caseKey)}`}>
                Explorer →
              </GhostButton>
            }
          />

          <RelatedNavigation items={related} />
        </ExplorerTutorAdvanced>
      </article>
    </ExplorerLayout>
  );
}
