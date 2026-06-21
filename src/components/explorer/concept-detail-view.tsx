import { getCaseLegendEntry } from "@/features/grammar/case-legend-data";
import type { ConceptKnowledge } from "@/types/knowledge-graph";
import { firstSentence } from "@/features/explorer/entity/types";
import { pickShortSentences } from "@/lib/explorer/explorer-ia";

import { ExplorerLemmaCardGrid, ExplorerTextCardGrid } from "./explorer-card-grid";
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
  const question = conceptQuestion(concept);
  const role = conceptRole(concept);
  const observedExamples = pickShortSentences(
    [
      ...relatedTexts.map((text) => text.sentenceRussian),
      ...concept.phrases.map((phrase) => phrase.label),
    ],
    5,
  );

  const textsGrouped = relatedTexts.reduce<
    Array<{ textId: string; textTitle: string; occurrenceCount: number }>
  >((acc, text) => {
    const existing = acc.find((item) => item.textId === text.textId);
    if (existing) {
      existing.occurrenceCount += 1;
      return acc;
    }
    acc.push({
      textId: text.textId,
      textTitle: text.textTitle,
      occurrenceCount: 1,
    });
    return acc;
  }, []);

  const commonWords = concept.lemmas.slice(0, 6).map((lemma) => ({
    label: lemma.lemma,
    href: `/explorer/lemmas/${encodeURIComponent(lemma.lemma)}?pos=${encodeURIComponent(lemma.partOfSpeech)}`,
  }));

  return (
    <div className="explorer-workspace-pane explorer-workspace-pane--detail">
      <article className="explorer-word">
        <header className="explorer-word__hero">
          <h1 className="explorer-word__lemma">
            {concept.concept.title.replace(/\s+case$/i, "").trim()}
          </h1>
        </header>

        {question ? (
          <ExplorerSection title="Question">
            <p className="explorer-word-section__prose">{question}</p>
          </ExplorerSection>
        ) : null}

        <ExplorerSection title="Role">
          <p className="explorer-word-section__prose">{role}</p>
        </ExplorerSection>

        {observedExamples.length > 0 ? (
          <ExplorerSection title="Observed examples">
            <ul className="explorer-word-example-list">
              {observedExamples.map((example) => (
                <li key={example} className="explorer-word-example">
                  <p className="explorer-word-example__russian break-russian font-reader">
                    {example}
                  </p>
                </li>
              ))}
            </ul>
          </ExplorerSection>
        ) : null}

        {textsGrouped.length > 0 ? (
          <ExplorerSection title="Seen in texts">
            <ExplorerTextCardGrid items={textsGrouped} />
          </ExplorerSection>
        ) : null}

        {commonWords.length > 0 ? (
          <ExplorerSection title="Common words">
            <ExplorerLemmaCardGrid items={commonWords} />
          </ExplorerSection>
        ) : null}
      </article>
    </div>
  );
}
