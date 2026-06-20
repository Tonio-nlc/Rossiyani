"use client";

type LibrarySearchProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
};

export function LibrarySearch({ value, onChange, resultCount }: LibrarySearchProps) {
  return (
    <div className="library-catalog-search">
      <label className="library-catalog-search-bar">
        <span className="sr-only">Rechercher dans la bibliothèque</span>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Rechercher un titre…"
          className="library-catalog-search-input focus-kb"
        />
        <span className="library-catalog-search-count" aria-live="polite">
          {resultCount} résultat{resultCount !== 1 ? "s" : ""}
        </span>
      </label>
    </div>
  );
}
