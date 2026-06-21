"use client";

type LibrarySearchProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
};

export function LibrarySearch({ value, onChange, resultCount }: LibrarySearchProps) {
  return (
    <label className="lib-search">
      <span className="sr-only">Rechercher dans la bibliothèque</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Rechercher un titre…"
        className="lib-search__input focus-kb"
      />
      <span className="lib-search__count" aria-live="polite">
        {resultCount} résultat{resultCount !== 1 ? "s" : ""}
      </span>
    </label>
  );
}
