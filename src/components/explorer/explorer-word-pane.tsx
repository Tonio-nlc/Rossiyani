import Link from "next/link";

import type { ExplorerWordPresentation } from "./explorer-word-presentation";
import { ExplorerLemmaCardGrid, ExplorerTextCardGrid } from "./explorer-card-grid";
import { ExplorerSection } from "./explorer-section";

type ExplorerWordPaneProps = {
  presentation: ExplorerWordPresentation;
  breadcrumb?: Array<{ label: string; href?: string }>;
};

export function ExplorerWordPane({ presentation, breadcrumb }: ExplorerWordPaneProps) {
  return (
    <article className="explorer-word">
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav className="explorer-word__crumb" aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => (
            <span key={`${item.label}-${index}`}>
              {item.href ? (
                <Link href={item.href} className="explorer-word__crumb-link focus-kb">
                  {item.label}
                </Link>
              ) : (
                <span className="explorer-word__crumb-current">{item.label}</span>
              )}
              {index < breadcrumb.length - 1 ? (
                <span className="explorer-word__crumb-sep" aria-hidden>
                  /
                </span>
              ) : null}
            </span>
          ))}
        </nav>
      ) : null}

      <header className="explorer-word__hero">
        <div className="explorer-word__headline">
          <h1 className="explorer-word__lemma break-russian">{presentation.label}</h1>
          {presentation.transcription ? (
            <p className="explorer-word__transcription">{presentation.transcription}</p>
          ) : null}
        </div>
        <p className="explorer-word__badge explorer-word__badge--solo">
          {presentation.partOfSpeechLabel}
        </p>
      </header>

      <ul className="explorer-word__actions">
        {presentation.readHref ? (
          <li>
            <Link href={presentation.readHref} className="explorer-word__action focus-kb">
              Read
            </Link>
          </li>
        ) : null}
        <li>
          <Link href={presentation.practiceHref} className="explorer-word__action focus-kb">
            Practice
          </Link>
        </li>
        <li>
          <Link href={presentation.exploreHref} className="explorer-word__action focus-kb">
            Explore
          </Link>
        </li>
      </ul>

      {presentation.definitions.length > 0 ? (
        <ExplorerSection title="Definitions">
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
        <ExplorerSection title="Examples">
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

      {presentation.relatedWords.length > 0 ? (
        <ExplorerSection title="Related words">
          <ExplorerLemmaCardGrid items={presentation.relatedWords} />
        </ExplorerSection>
      ) : null}
    </article>
  );
}
