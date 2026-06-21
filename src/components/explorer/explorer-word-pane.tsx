import type { ExplorerWordPresentation } from "./explorer-word-presentation";
import { ExplorerLemmaCardGrid, ExplorerTextCardGrid } from "./explorer-card-grid";
import { ExplorerEntityHeader } from "./explorer-entity-header";
import { ExplorerExampleList } from "./explorer-example-list";
import { ExplorerSection } from "./explorer-section";

type ExplorerWordPaneProps = {
  presentation: ExplorerWordPresentation;
  breadcrumb?: Array<{ label: string; href?: string }>;
};

export function ExplorerWordPane({ presentation, breadcrumb }: ExplorerWordPaneProps) {
  const actions = [
    ...(presentation.readHref
      ? [{ label: "Read", href: presentation.readHref }]
      : []),
    { label: "Practice", href: presentation.practiceHref },
    { label: "Explore", href: presentation.exploreHref },
  ];

  return (
    <article className="explorer-word explorer-word--detail">
      <ExplorerEntityHeader
        breadcrumb={breadcrumb}
        title={presentation.label}
        subtitle={presentation.transcription}
        badges={
          <span className="explorer-word__badge explorer-word__badge--accent">
            {presentation.partOfSpeechLabel}
          </span>
        }
        actions={actions}
      />

      {presentation.definitions.length > 0 ? (
        <ExplorerSection
          title="Definitions"
          icon="definitions"
          lead="What this word means in your reading"
        >
          <ol className="explorer-word-definitions">
            {presentation.definitions.map((definition, index) => (
              <li key={`${definition.meaning}-${index}`} className="explorer-word-definitions__item">
                <p className="explorer-word-definitions__text">{definition.meaning}</p>
                {definition.note ? (
                  <p className="explorer-word-definitions__note">{definition.note}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </ExplorerSection>
      ) : null}

      {presentation.examples.length > 0 ? (
        <ExplorerSection
          title="Examples"
          icon="examples"
          lead="Short sentences from your library"
        >
          <ExplorerExampleList examples={presentation.examples} />
        </ExplorerSection>
      ) : null}

      {presentation.foundInTexts.length > 0 ? (
        <ExplorerSection
          title="Found in your texts"
          icon="texts"
          lead="Where you have already encountered it"
        >
          <ExplorerTextCardGrid items={presentation.foundInTexts} />
        </ExplorerSection>
      ) : null}

      {presentation.relatedWords.length > 0 ? (
        <ExplorerSection
          title="Related words"
          icon="related-words"
          lead="Words from the same family"
        >
          <ExplorerLemmaCardGrid items={presentation.relatedWords} />
        </ExplorerSection>
      ) : null}
    </article>
  );
}
