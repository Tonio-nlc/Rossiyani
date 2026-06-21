import type { ExplorerPhrasePresentation } from "./explorer-phrase-presentation";
import { ExplorerBreadcrumbNav } from "./explorer-breadcrumb-nav";
import { ExplorerLemmaCardGrid, ExplorerTextCardGrid } from "./explorer-card-grid";
import { ExplorerSection } from "./explorer-section";

type ExplorerPhrasePaneProps = {
  presentation: ExplorerPhrasePresentation;
};

export function ExplorerPhrasePane({ presentation }: ExplorerPhrasePaneProps) {
  const isCollocation = presentation.kind === "collocation";

  return (
    <article className="explorer-word">
      <ExplorerBreadcrumbNav items={presentation.breadcrumb} />

      <header className="explorer-word__hero">
        <div className="explorer-word__headline">
          <h1 className="explorer-word__lemma break-russian">{presentation.label}</h1>
          {presentation.translation ? (
            <p className="explorer-word__transcription">{presentation.translation}</p>
          ) : null}
        </div>
        {presentation.registerBadge ? (
          <p className="explorer-word__badge explorer-word__badge--solo">
            {presentation.registerBadge}
          </p>
        ) : null}
      </header>

      <ExplorerSection title="Meaning">
        <p className="explorer-word-section__prose">{presentation.meaning}</p>
      </ExplorerSection>

      <ExplorerSection title={isCollocation ? "When to use" : "When Russians use it"}>
        <p className="explorer-word-section__prose">{presentation.whenToUse}</p>
      </ExplorerSection>

      {presentation.examples.length > 0 ? (
        <ExplorerSection title="Real examples">
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

      {isCollocation && presentation.relatedWords.length > 0 ? (
        <ExplorerSection title="Related words">
          <ExplorerLemmaCardGrid items={presentation.relatedWords} />
        </ExplorerSection>
      ) : null}

      {!isCollocation && presentation.similarExpressions.length > 0 ? (
        <ExplorerSection title="Similar expressions">
          <ExplorerLemmaCardGrid items={presentation.similarExpressions} />
        </ExplorerSection>
      ) : null}

      {presentation.foundInTexts.length > 0 ? (
        <ExplorerSection title="Found in your texts">
          <ExplorerTextCardGrid items={presentation.foundInTexts} />
        </ExplorerSection>
      ) : null}
    </article>
  );
}
