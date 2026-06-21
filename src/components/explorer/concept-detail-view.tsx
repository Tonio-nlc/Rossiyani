import { getCaseLegendEntry } from "@/features/grammar/case-legend-data";
import type { ConceptKnowledge } from "@/types/knowledge-graph";
import { firstSentence } from "@/features/explorer/entity/types";
import { groupOccurrencesByText, pickShortSentences } from "@/lib/explorer/explorer-ia";

import { ExplorerLemmaCardGrid, ExplorerTextCardGrid } from "./explorer-card-grid";
import { ExplorerEntityHeader } from "./explorer-entity-header";
import { ExplorerExampleList } from "./explorer-example-list";
import { ExplorerSection } from "./explorer-section";

type ConceptDetailViewProps = {
  concept: ConceptKnowledge;
  relatedTexts: Array<{ textId: string; textTitle: string; sentenceRussian: string }>;
};

function conceptRole(concept: ConceptKnowledge): string {
  if (concept.concept.frenchComparison?.trim()) {
    return firstSentence(concept.concept.frenchComparison.trim());
  }
  return firstSentence(concept.concept.canonicalExplanation);
}

function conceptQuestion(concept: ConceptKnowledge): string | null {
  const caseNode = concept.cases[0];
  if (caseNode) {
    const legend = getCaseLegendEntry(caseNode.caseKey as import("@/features/grammar").CaseKey);
    return legend?.question ?? null;
  }
  return null;
}

export function ConceptDetailView({ concept, relatedTexts }: ConceptDetailViewProps) {
  const title = concept.concept.title.replace(/\s+case$/i, "").trim();
  const question = conceptQuestion(concept);
  const role = conceptRole(concept);
  const observedExamples = pickShortSentences(
    [
      ...relatedTexts.map((text) => text.sentenceRussian),
      ...concept.phrases.map((phrase) => phrase.label),
    ],
    5,
  );

  const textsGrouped = groupOccurrencesByText(
    relatedTexts.map((text) => ({
      textId: text.textId,
      textTitle: text.textTitle,
      sentenceRussian: text.sentenceRussian,
    })),
  );

  const commonWords = concept.lemmas.slice(0, 6).map((lemma) => ({
    label: lemma.lemma,
    href: `/explorer/lemmas/${encodeURIComponent(lemma.lemma)}?pos=${encodeURIComponent(lemma.partOfSpeech)}`,
    hint: "Shows this pattern often",
  }));

  return (
    <div className="explorer-workspace-pane explorer-workspace-pane--detail">
      <article className="explorer-word explorer-word--detail">
        <ExplorerEntityHeader
          breadcrumb={[
            { label: "Explorer", href: "/explorer" },
            { label: "Concepts", href: "/explorer/concepts" },
            { label: title },
          ]}
          title={title}
          subtitle="Grammar pattern from your texts"
          badges={<span className="explorer-word__badge explorer-word__badge--accent">Concept</span>}
        />

        {question ? (
          <ExplorerSection title="Question" icon="question" lead="How to recognize this pattern">
            <p className="explorer-word-section__prose">{question}</p>
          </ExplorerSection>
        ) : null}

        <ExplorerSection title="Role" icon="role" lead="What job it plays in a sentence">
          <p className="explorer-word-section__prose">{role}</p>
        </ExplorerSection>

        {observedExamples.length > 0 ? (
          <ExplorerSection
            title="Observed examples"
            icon="examples"
            lead="Lines where you have seen it"
          >
            <ExplorerExampleList examples={observedExamples} />
          </ExplorerSection>
        ) : null}

        {textsGrouped.length > 0 ? (
          <ExplorerSection
            title="Seen in texts"
            icon="texts"
            lead="Your readings that contain this pattern"
          >
            <ExplorerTextCardGrid items={textsGrouped} />
          </ExplorerSection>
        ) : null}

        {commonWords.length > 0 ? (
          <ExplorerSection
            title="Common words"
            icon="related-words"
            lead="Lemmas that illustrate this idea"
          >
            <ExplorerLemmaCardGrid items={commonWords} />
          </ExplorerSection>
        ) : null}
      </article>
    </div>
  );
}
