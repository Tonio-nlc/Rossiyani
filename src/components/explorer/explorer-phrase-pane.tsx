import type { ExplorerPhrasePresentation } from "./explorer-phrase-presentation";
import { ExplorerLemmaCardGrid, ExplorerTextCardGrid } from "./explorer-card-grid";
import { ExplorerEntityHeader } from "./explorer-entity-header";
import { ExplorerExampleList } from "./explorer-example-list";
import { ExplorerSection } from "./explorer-section";

type ExplorerPhrasePaneProps = {
  presentation: ExplorerPhrasePresentation;
};

export function ExplorerPhrasePane({ presentation }: ExplorerPhrasePaneProps) {
  const isCollocation = presentation.kind === "collocation";

  return (
    <article className="explorer-word explorer-word--detail">
      <ExplorerEntityHeader
        breadcrumb={presentation.breadcrumb}
        title={presentation.label}
        subtitle={presentation.translation}
        badges={
          presentation.registerBadge ? (
            <span className="explorer-word__badge explorer-word__badge--accent">
              {presentation.registerBadge}
            </span>
          ) : null
        }
      />

      <ExplorerSection
        title="Meaning"
        icon="meaning"
        lead="What native speakers intend by this"
      >
        <p className="explorer-word-section__prose">{presentation.meaning}</p>
      </ExplorerSection>

      <ExplorerSection
        title={isCollocation ? "When to use" : "When Russians use it"}
        icon="usage"
        lead="Practical situations from your reading"
      >
        <p className="explorer-word-section__prose">{presentation.whenToUse}</p>
      </ExplorerSection>

      {presentation.examples.length > 0 ? (
        <ExplorerSection
          title="Real examples"
          icon="examples"
          lead="Authentic lines from your texts"
        >
          <ExplorerExampleList examples={presentation.examples} />
        </ExplorerSection>
      ) : null}

      {isCollocation && presentation.relatedWords.length > 0 ? (
        <ExplorerSection
          title="Related words"
          icon="related-words"
          lead="Lemmas that appear in this combination"
        >
          <ExplorerLemmaCardGrid items={presentation.relatedWords} />
        </ExplorerSection>
      ) : null}

      {!isCollocation && presentation.similarExpressions.length > 0 ? (
        <ExplorerSection
          title="Similar expressions"
          icon="similar"
          lead="Other phrases you may hear in the same situations"
        >
          <ExplorerLemmaCardGrid items={presentation.similarExpressions} />
        </ExplorerSection>
      ) : null}

      {presentation.foundInTexts.length > 0 ? (
        <ExplorerSection
          title="Found in your texts"
          icon="texts"
          lead="Where you have already heard this"
        >
          <ExplorerTextCardGrid items={presentation.foundInTexts} />
        </ExplorerSection>
      ) : null}
    </article>
  );
}
