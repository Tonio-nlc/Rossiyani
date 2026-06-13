import type { ReactNode } from "react";
import type { CefrLevel } from "@/types";

import type { LibraryTagFilter } from "./library-utils";
import { LIBRARY_LEVELS, LIBRARY_TAGS } from "./library-utils";

type LibraryFiltersProps = {
  level: CefrLevel | "all";
  tag: LibraryTagFilter;
  onLevelChange: (level: CefrLevel | "all") => void;
  onTagChange: (tag: LibraryTagFilter) => void;
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
  tag,
  onLevelChange,
  onTagChange,
}: LibraryFiltersProps) {
  const hasActiveFilter = level !== "all" || tag !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
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
        <FilterChip active={tag === "all"} onClick={() => onTagChange("all")}>
          Toutes catégories
        </FilterChip>
        {LIBRARY_TAGS.map(({ id, label }) => (
          <FilterChip key={id} active={tag === id} onClick={() => onTagChange(id)}>
            {label}
          </FilterChip>
        ))}
        {hasActiveFilter ? (
          <button
            type="button"
            onClick={() => {
              onLevelChange("all");
              onTagChange("all");
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
