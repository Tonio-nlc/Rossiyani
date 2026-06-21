import type { ReactNode } from "react";

import { getAllCategories } from "@/content/categories";

import type { LibraryCategoryFilter } from "./library-utils";

type LibraryFiltersProps = {
  category: LibraryCategoryFilter;
  onCategoryChange: (category: LibraryCategoryFilter) => void;
};

function TypeFilter({
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
      className={[
        "lib-filter focus-kb",
        active ? "lib-filter-active" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function LibraryFilters({ category, onCategoryChange }: LibraryFiltersProps) {
  return (
    <div className="lib-filter-row" role="group" aria-label="Types">
      <TypeFilter active={category === "all"} onClick={() => onCategoryChange("all")}>
        Toutes
      </TypeFilter>
      {getAllCategories().map(({ id, label }) => (
        <TypeFilter
          key={id}
          active={category === id}
          onClick={() => onCategoryChange(id)}
        >
          {label}
        </TypeFilter>
      ))}
    </div>
  );
}
