import type { KeyboardEvent, RefObject } from "react";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  ariaLabel?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export function SearchField({
  value,
  onChange,
  placeholder = "Rechercher…",
  resultCount,
  ariaLabel = "Rechercher",
  inputRef,
  onKeyDown,
}: SearchFieldProps) {
  return (
    <div className="ds-search-field">
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
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
