type LibraryHeaderProps = {
  textCount: number;
  sentenceCount: number;
};

export function LibraryHeader({ textCount, sentenceCount }: LibraryHeaderProps) {
  return (
    <header className="space-y-3 pb-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-violet-bright)]">
            Collection
          </p>
          <h1 className="mt-1 font-reader text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Bibliothèque
          </h1>
        </div>
        <div className="flex gap-3 text-sm text-[var(--muted)]">
          <span>
            <strong className="font-semibold text-[var(--foreground)]">{textCount}</strong> textes
          </span>
          <span className="text-[var(--border-strong)]">·</span>
          <span>
            <strong className="font-semibold text-[var(--foreground)]">{sentenceCount}</strong>{" "}
            phrases
          </span>
        </div>
      </div>
      <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Textes russes analysés mot à mot — prêts pour une lecture profonde, sans traduction
        automatique.
      </p>
    </header>
  );
}
