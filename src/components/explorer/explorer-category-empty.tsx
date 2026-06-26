import { EmptyState } from "@/components/design-system";

import { EXPLORER_EMPTY_MESSAGE } from "./explorer-categories";

function SearchVisual() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16.5 16.5 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ExplorerCategoryEmpty() {
  return (
    <EmptyState
      eyebrow="Exploration"
      title="Aucun résultat ici"
      description={EXPLORER_EMPTY_MESSAGE}
      visual={<SearchVisual />}
      action={{ label: "Ouvrir le vocabulaire", href: "/vocabulary" }}
    />
  );
}
