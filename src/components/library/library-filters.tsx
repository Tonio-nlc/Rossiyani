import type { ReactNode } from "react";

import { getAllCategories } from "@/content/categories";
import { Divider, Tag } from "@/components/design-system";
import type { CefrLevel } from "@/types";

import type { LibraryCategoryFilter, LibraryCollectionFilter } from "./library-utils";
import { LIBRARY_LEVELS } from "./library-utils";

type LibraryFiltersProps = {
  level: CefrLevel | "all";
  category: LibraryCategoryFilter;
  onLevelChange: (level: CefrLevel | "all") => void;
  onCategoryChange: (category: LibraryCategoryFilter) => void;
  onResetAll?: () => void;
};

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-eyebrow">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
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
    <section className="library-page-section space-y-4" aria-label="Filtres">
      <FilterGroup label="Niveau">
        <Tag active={level === "all"} onClick={() => onLevelChange("all")}>
          Tous
        </Tag>
        {LIBRARY_LEVELS.map((l) => (
          <Tag key={l} active={level === l} onClick={() => onLevelChange(l)}>
            {l}
          </Tag>
        ))}
      </FilterGroup>

      <Divider />

      <FilterGroup label="Catégories">
        <Tag active={category === "all"} onClick={() => onCategoryChange("all")}>
          Toutes
        </Tag>
        {getAllCategories().map(({ id, label }) => (
          <Tag key={id} active={category === id} onClick={() => onCategoryChange(id)}>
            {label}
          </Tag>
        ))}
      </FilterGroup>

      {hasActiveFilter && onResetAll ? (
        <button type="button" onClick={onResetAll} className="ds-ghost-btn focus-kb text-xs">
          Réinitialiser les filtres
        </button>
      ) : null}
    </section>
  );
}
