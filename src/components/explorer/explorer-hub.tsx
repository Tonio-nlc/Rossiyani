import { GhostButton } from "@/components/design-system";

import type { LemmaBrowseCard, PortalBrowseCard } from "@/features/explorer/get-explorer-browse-data";
import { ExplorerExploreGrid } from "./explorer-explore-grid";
import { ExplorerSearchPanel } from "./explorer-search-panel";

const PORTAL_INDEX: PortalBrowseCard[] = [
  {
    kind: "portal",
    title: "Lemmes",
    href: "/explorer/lemmas",
    description: "Entrées lexicales de vos textes importés.",
    meta: "Archive",
  },
  {
    kind: "portal",
    title: "Concepts",
    href: "/explorer/concepts",
    description: "Motifs grammaticaux et régularités observées.",
    meta: "Grammaire",
  },
  {
    kind: "portal",
    title: "Cas",
    href: "/explorer/cases",
    description: "Les six cas comme portails d'étude.",
    meta: "6 cas",
  },
  {
    kind: "portal",
    title: "Terminaisons",
    href: "/explorer/endings",
    description: "Paradigmes fléchis et terminaisons récurrentes.",
  },
  {
    kind: "portal",
    title: "Collocations",
    href: "/explorer/collocations",
    description: "Cooccurrences naturelles du russe authentique.",
  },
  {
    kind: "portal",
    title: "Expressions",
    href: "/explorer/expressions",
    description: "Tournures idiomatiques et constructions natives.",
  },
];

type ExplorerHubProps = {
  isEmpty: boolean;
  featuredLemmas: LemmaBrowseCard[];
};

export function ExplorerHub({ isEmpty, featuredLemmas }: ExplorerHubProps) {
  const spotlightCards = featuredLemmas.slice(0, 4);

  return (
    <div className="explorer-workspace-pane">
      <ExplorerSearchPanel autoFocus={!isEmpty} />
      <ExplorerExploreGrid title="Index" cards={PORTAL_INDEX} />
      {!isEmpty && spotlightCards.length > 0 ? (
        <ExplorerExploreGrid title="Entrées fréquentes" cards={spotlightCards} />
      ) : null}
      {!isEmpty ? null : (
        <div className="explorer-workspace-pane__empty">
          <GhostButton href="/import">Importer →</GhostButton>
        </div>
      )}
    </div>
  );
}
