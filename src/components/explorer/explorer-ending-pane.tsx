import type { ExplorerEndingPresentation } from "./explorer-ending-presentation";
import { ExplorerBreadcrumbNav } from "./explorer-breadcrumb-nav";
import { ExplorerLemmaCardGrid, ExplorerTextCardGrid } from "./explorer-card-grid";
import { ExplorerSection } from "./explorer-section";

type ExplorerEndingPaneProps = {
  presentation: ExplorerEndingPresentation;
};

export function ExplorerEndingPane({ presentation }: ExplorerEndingPaneProps) {
  return (
    <article className="explorer-word">
      <ExplorerBreadcrumbNav items={presentation.breadcrumb} />

      <header className="explorer-word__hero">
        <div className="explorer-word__headline">
          <h1 className="explorer-word__lemma break-russian">{presentation.label}</h1>
          <p className="explorer-word__transcription">{presentation.shortDescription}</p>
        </div>
      </header>

      <ExplorerSection title="Grammatical function">
        <p className="explorer-word-section__prose">{presentation.grammaticalFunction}</p>
      </ExplorerSection>

      {presentation.commonWords.length > 0 ? (
        <ExplorerSection title="Common words">
          <ExplorerLemmaCardGrid items={presentation.commonWords} />
        </ExplorerSection>
      ) : null}

      {presentation.examples.length > 0 ? (
        <ExplorerSection title="Observed examples">
          <ul className="explorer-word-example-list">
            {presentation.examples.map((example) => (
              <li key={example.russian} className="explorer-word-example">
                <p className="explorer-word-example__russian break-russian font-reader">
                  {example.russian}
                </p>
                {example.translation ? (
                  <p className="explorer-word-example__translation">{example.translation}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </ExplorerSection>
      ) : null}

      {presentation.foundInTexts.length > 0 ? (
        <ExplorerSection title="Found in your texts">
          <ExplorerTextCardGrid items={presentation.foundInTexts} />
        </ExplorerSection>
      ) : null}

      {presentation.relatedConcepts.length > 0 ? (
        <ExplorerSection title="Related concepts">
          <ExplorerLemmaCardGrid items={presentation.relatedConcepts} />
        </ExplorerSection>
      ) : null}
    </article>
  );
}
