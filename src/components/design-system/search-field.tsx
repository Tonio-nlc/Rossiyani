type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  ariaLabel?: string;
};

export function SearchField({
  value,
  onChange,
  placeholder = "Rechercher…",
  resultCount,
  ariaLabel = "Rechercher",
}: SearchFieldProps) {
  return (
    <div className="ds-search-field">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="focus-kb ds-search-input"
      />
      {resultCount !== undefined ? (
        <span className="ds-search-meta" aria-live="polite">
          {resultCount} résultat{resultCount !== 1 ? "s" : ""}
        </span>
      ) : null}
    </div>
  );
}
