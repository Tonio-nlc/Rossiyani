type LibrarySearchProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
};

export function LibrarySearch({ value, onChange, resultCount }: LibrarySearchProps) {
  return (
    <div className="sticky top-[var(--header-height)] z-30 -mx-1 bg-[var(--background)]/80 px-1 py-3 backdrop-blur-xl">
      <div className="surface-elevated flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 shadow-[var(--shadow-soft)] transition-shadow focus-within:border-[var(--accent-violet)]/40 focus-within:shadow-[var(--shadow-glow)]">
        <span className="text-[var(--muted)]" aria-hidden>
          🔎
        </span>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Rechercher par titre, source ou niveau…"
          aria-label="Rechercher dans la bibliothèque"
          className="focus-kb min-w-0 flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none"
        />
        <span className="shrink-0 text-xs text-[var(--muted)]">
          {resultCount} résultat{resultCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
