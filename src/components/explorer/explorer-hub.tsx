import type { ExplorerEditorialData } from "@/features/explorer/get-explorer-editorial";

import { GhostButton } from "@/components/design-system";

import { ExplorerCompactList } from "./explorer-compact-list";
import { ExplorerRecentSection } from "./explorer-recent-section";
import { ExplorerSearchPanel } from "./explorer-search-panel";

const INDEX_LINKS = [
  { label: "Lemmes", href: "/explorer/lemmas", meta: "Archive" },
  { label: "Concepts", href: "/explorer/concepts", meta: "Grammaire" },
  { label: "Cas", href: "/explorer/cases", meta: "6 cas" },
  { label: "Terminaisons", href: "/explorer/endings", meta: "Paradigmes" },
  { label: "Collocations", href: "/explorer/collocations", meta: "Cooccurrences" },
  { label: "Expressions", href: "/explorer/expressions", meta: "Idiomes" },
] as const;

type ExplorerHubProps = {
  editorial: ExplorerEditorialData;
  isEmpty: boolean;
};

function ExplorerEditorialPicks({ editorial }: { editorial: ExplorerEditorialData }) {
  const { todaysLanguage, popularConstructions, nativeExpressions } = editorial;
  const picks = [
    ...(todaysLanguage
      ? [
          {
            label: todaysLanguage.displayLabel,
            href: todaysLanguage.explorerHref,
            subtitle: todaysLanguage.subtitle,
          },
        ]
      : []),
    ...popularConstructions.map((pick) => ({
      label: pick.label,
      href: pick.href,
    })),
    ...nativeExpressions.map((pick) => ({
      label: pick.label,
      href: pick.href,
    })),
  ];

  if (picks.length === 0) {
    return null;
  }

  return <ExplorerCompactList title="Sélection" items={picks} />;
}

export function ExplorerHub({ editorial, isEmpty }: ExplorerHubProps) {
  return (
    <div className="explorer-workspace-pane">
      <ExplorerSearchPanel autoFocus={!isEmpty} />
      <ExplorerCompactList title="Index" items={[...INDEX_LINKS]} />
      {!isEmpty ? (
        <>
          <ExplorerRecentSection />
          <ExplorerEditorialPicks editorial={editorial} />
        </>
      ) : (
        <div className="explorer-workspace-pane__empty">
          <GhostButton href="/import">Importer →</GhostButton>
        </div>
      )}
    </div>
  );
}
