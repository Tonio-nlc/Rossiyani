import type { CefrLevel } from "@/types";

import { LIBRARY_LEVELS } from "./library-utils";

type LibraryWorkspaceHeroProps = {
  level: CefrLevel | "all";
  onLevelChange: (level: CefrLevel | "all") => void;
};

export function LibraryWorkspaceHero({ level, onLevelChange }: LibraryWorkspaceHeroProps) {
  return (
    <header className="library-ws-hero">
      <div>
        <h1 className="r3-hero-title library-ws-hero__title">Bibliothèque</h1>
        <p className="r3-lead library-ws-hero__lead">
          Votre bibliothèque russe curatée — textes, collections et progrès de lecture.
        </p>
      </div>

      <div className="library-ws-levels" role="group" aria-label="Niveau">
        <button
          type="button"
          aria-pressed={level === "all"}
          onClick={() => onLevelChange("all")}
          className={[
            "library-ws-level-pill focus-kb",
            level === "all" ? "library-ws-level-pill--active" : "",
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
              "library-ws-level-pill focus-kb",
              level === value ? "library-ws-level-pill--active" : "",
            ].join(" ")}
          >
            {value}
          </button>
        ))}
      </div>
    </header>
  );
}
