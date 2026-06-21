import Link from "next/link";

import type { ExplorerEditorialData } from "@/features/explorer/get-explorer-editorial";
import type {
  ConceptBrowseCard,
  PortalBrowseCard,
} from "@/features/explorer/get-explorer-browse-data";

import { ExplorerContextRecent } from "./explorer-context-recent";

export type ExplorerContextPanelData = {
  editorial: ExplorerEditorialData;
  relatedConcepts: ConceptBrowseCard[];
  randomDiscovery: PortalBrowseCard | null;
};

type ExplorerContextPanelProps = {
  data: ExplorerContextPanelData;
};

export function ExplorerContextPanel({ data }: ExplorerContextPanelProps) {
  const { editorial, relatedConcepts, randomDiscovery } = data;
  const wordOfDay = editorial.todaysLanguage;

  return (
    <div className="explorer-context-panel">
      <p className="explorer-context-panel__title">Microscope</p>

      {wordOfDay ? (
        <section className="explorer-context-panel__section">
          <h3 className="explorer-context-panel__section-title">Mot du jour</h3>
          <Link href={wordOfDay.explorerHref} className="explorer-context-panel__spotlight focus-kb">
            <p className="explorer-context-panel__spotlight-label break-russian">
              {wordOfDay.displayLabel}
            </p>
            <p className="explorer-context-panel__spotlight-sub">{wordOfDay.subtitle}</p>
            {wordOfDay.exampleRussian ? (
              <p className="explorer-context-panel__spotlight-preview break-russian font-reader">
                {wordOfDay.exampleRussian}
              </p>
            ) : null}
          </Link>
        </section>
      ) : null}

      {relatedConcepts.length > 0 ? (
        <section className="explorer-context-panel__section">
          <h3 className="explorer-context-panel__section-title">Concepts liés</h3>
          <ul className="explorer-context-panel__list">
            {relatedConcepts.map((concept) => (
              <li key={concept.href}>
                <Link href={concept.href} className="explorer-context-panel__link focus-kb">
                  {concept.title}
                </Link>
                <p className="explorer-context-panel__link-meta">{concept.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="explorer-context-panel__section">
        <h3 className="explorer-context-panel__section-title">Activité récente</h3>
        <ExplorerContextRecent />
      </section>

      {randomDiscovery ? (
        <section className="explorer-context-panel__section">
          <h3 className="explorer-context-panel__section-title">Découverte aléatoire</h3>
          <Link href={randomDiscovery.href} className="explorer-context-panel__discovery focus-kb">
            <p className="explorer-context-panel__discovery-label break-russian">
              {randomDiscovery.title}
            </p>
            <p className="explorer-context-panel__discovery-meta">{randomDiscovery.description}</p>
            {randomDiscovery.context ? (
              <p className="explorer-context-panel__discovery-type">{randomDiscovery.context}</p>
            ) : null}
          </Link>
        </section>
      ) : null}
    </div>
  );
}
