import type { ReactNode } from "react";

import { getAllCategories } from "@/content/categories";
import type { CefrLevel } from "@/types";

import type { LibraryCategoryFilter } from "./library-utils";
import { LIBRARY_LEVELS } from "./library-utils";

type LibraryFiltersProps = {
  level: CefrLevel | "all";
  category: LibraryCategoryFilter;
  onLevelChange: (level: CefrLevel | "all") => void;
  onCategoryChange: (category: LibraryCategoryFilter) => void;
  onResetAll?: () => void;
};

function CatalogFilter({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="library-catalog-filter focus-kb"
    >
      {children}
    </button>
  );
}

export function LibraryFilters({
  level,
  category,
  onLevelChange,
  onCategoryChange,
  onResetAll,
}: LibraryFiltersProps) {
  const hasActiveFilter = level !== "all" || category !== "all";

  return (
    <section className="library-page-section library-catalog-filters-section" aria-label="Filtres">
      <div className="library-catalog-filter-row" role="group" aria-label="Niveau">
        <CatalogFilter active={level === "all"} onClick={() => onLevelChange("all")}>
          Tous
        </CatalogFilter>
        {LIBRARY_LEVELS.map((l) => (
          <CatalogFilter key={l} active={level === l} onClick={() => onLevelChange(l)}>
            {l}
          </CatalogFilter>
        ))}
      </div>

      <div
        className="library-catalog-filter-row library-catalog-filter-row-secondary"
        role="group"
        aria-label="Catégories"
      >
        <CatalogFilter active={category === "all"} onClick={() => onCategoryChange("all")}>
          Toutes
        </CatalogFilter>
        {getAllCategories().map(({ id, label }) => (
          <CatalogFilter
            key={id}
            active={category === id}
            onClick={() => onCategoryChange(id)}
          >
            {label}
          </CatalogFilter>
        ))}
      </div>

      {hasActiveFilter && onResetAll ? (
        <button type="button" onClick={onResetAll} className="library-catalog-reset focus-kb">
          Réinitialiser
        </button>
      ) : null}
    </section>
  );
}
