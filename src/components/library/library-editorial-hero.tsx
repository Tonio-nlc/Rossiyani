import type { CefrLevel } from "@/types";

import { LIBRARY_LEVELS } from "./library-utils";

type LibraryEditorialHeroProps = {
  level: CefrLevel | "all";
  onLevelChange: (level: CefrLevel | "all") => void;
};

export function LibraryEditorialHero({ level, onLevelChange }: LibraryEditorialHeroProps) {
  return (
    <header className="lib-editorial-hero">
      <h1 className="lib-editorial-hero__title">Bibliothèque</h1>

      <div className="lib-editorial-hero__levels" role="group" aria-label="Niveau">
        <button
          type="button"
          aria-pressed={level === "all"}
          onClick={() => onLevelChange("all")}
          className={[
            "lib-level-pill focus-kb",
            level === "all" ? "lib-level-pill-active" : "",
          ].join(" ")}
        >
          Tous
        </button>
        {LIBRARY_LEVELS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={level === value}
            onClick={() => onLevelChange(value)}
            className={[
              "lib-level-pill focus-kb",
              level === value ? "lib-level-pill-active" : "",
            ].join(" ")}
          >
            {value}
          </button>
        ))}
      </div>
    </header>
  );
}
