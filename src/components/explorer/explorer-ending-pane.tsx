import type { ExplorerEndingPresentation } from "./explorer-ending-presentation";
import { ExplorerLemmaCardGrid, ExplorerTextCardGrid } from "./explorer-card-grid";
import { ExplorerEntityHeader } from "./explorer-entity-header";
import { ExplorerExampleList } from "./explorer-example-list";
import { ExplorerSection } from "./explorer-section";

type ExplorerEndingPaneProps = {
  presentation: ExplorerEndingPresentation;
};

export function ExplorerEndingPane({ presentation }: ExplorerEndingPaneProps) {
  return (
    <article className="explorer-word explorer-word--detail">
      <ExplorerEntityHeader
        breadcrumb={presentation.breadcrumb}
        title={presentation.label}
        subtitle={presentation.shortDescription}
      />

      <ExplorerSection
        title="Grammatical function"
        icon="function"
        lead="What this ending signals in real usage"
      >
        <p className="explorer-word-section__prose">{presentation.grammaticalFunction}</p>
      </ExplorerSection>

      {presentation.commonWords.length > 0 ? (
        <ExplorerSection
          title="Common words"
          icon="related-words"
          lead="Forms you may recognize from your texts"
        >
          <ExplorerLemmaCardGrid items={presentation.commonWords} />
        </ExplorerSection>
      ) : null}

      {presentation.examples.length > 0 ? (
        <ExplorerSection
          title="Observed examples"
          icon="examples"
          lead="Sentences where this ending appears"
        >
          <ExplorerExampleList examples={presentation.examples} />
        </ExplorerSection>
      ) : null}

      {presentation.foundInTexts.length > 0 ? (
        <ExplorerSection
          title="Found in your texts"
          icon="texts"
          lead="Texts where this pattern shows up"
        >
          <ExplorerTextCardGrid items={presentation.foundInTexts} />
        </ExplorerSection>
      ) : null}

      {presentation.relatedConcepts.length > 0 ? (
        <ExplorerSection
          title="Related concepts"
          icon="related-concepts"
          lead="Grammar ideas connected to this ending"
        >
          <ExplorerLemmaCardGrid
            items={presentation.relatedConcepts.map((concept) => ({
              ...concept,
              hint: "Related grammar idea",
            }))}
          />
        </ExplorerSection>
      ) : null}
    </article>
  );
}
