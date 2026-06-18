import type { ReactNode } from "react";

import { getAllCategories } from "@/content/categories";
import { getAllCollections } from "@/content/collections";
import type { CefrLevel } from "@/types";

import type { LibraryCategoryFilter, LibraryCollectionFilter } from "./library-utils";
import { LIBRARY_LEVELS } from "./library-utils";

type LibraryFiltersProps = {
  level: CefrLevel | "all";
  collection: LibraryCollectionFilter;
  category: LibraryCategoryFilter;
  onLevelChange: (level: CefrLevel | "all") => void;
  onCollectionChange: (collection: LibraryCollectionFilter) => void;
  onCategoryChange: (category: LibraryCategoryFilter) => void;
};

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "focus-kb chip-transition rounded-full border px-3.5 py-1.5 text-xs font-medium",
        active
          ? "border-[var(--accent-violet)]/60 bg-[var(--accent-violet)]/15 text-[var(--accent-violet-bright)] shadow-[var(--shadow-glow)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function LibraryFilters({
  level,
  collection,
  category,
  onLevelChange,
  onCollectionChange,
  onCategoryChange,
}: LibraryFiltersProps) {
  const hasActiveFilter = level !== "all" || collection !== "all" || category !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Niveau
        </span>
        <FilterChip active={level === "all"} onClick={() => onLevelChange("all")}>
          Tous
        </FilterChip>
        {LIBRARY_LEVELS.map((l) => (
          <FilterChip key={l} active={level === l} onClick={() => onLevelChange(l)}>
            {l}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Collections
        </span>
        <FilterChip active={collection === "all"} onClick={() => onCollectionChange("all")}>
          Toutes
        </FilterChip>
        {getAllCollections().map(({ id, name }) => (
          <FilterChip
            key={id}
            active={collection === id}
            onClick={() => onCollectionChange(id)}
          >
            {name}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Catégories
        </span>
        <FilterChip active={category === "all"} onClick={() => onCategoryChange("all")}>
          Toutes
        </FilterChip>
        {getAllCategories().map(({ id, label }) => (
          <FilterChip key={id} active={category === id} onClick={() => onCategoryChange(id)}>
            {label}
          </FilterChip>
        ))}
        {hasActiveFilter ? (
          <button
            type="button"
            onClick={() => {
              onLevelChange("all");
              onCollectionChange("all");
              onCategoryChange("all");
            }}
            className="focus-kb text-xs text-[var(--accent-violet-bright)] hover:underline"
          >
            Réinitialiser
          </button>
        ) : null}
      </div>
    </div>
  );
}
