type LibraryPageIntroProps = {
  textCount?: number;
  sentenceCount?: number;
};

export function LibraryPageIntro({ textCount, sentenceCount }: LibraryPageIntroProps) {
  return (
    <header className="space-y-3">
      <h1 className="font-reader text-[clamp(2rem,5vw,2.75rem)] font-semibold leading-tight tracking-tight text-[var(--ink)]">
        Library
      </h1>
      <p className="max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        Your personal collection of texts and saved content.
      </p>
      {textCount !== undefined && sentenceCount !== undefined ? (
        <p className="text-xs text-[var(--ink-muted)]">
          {textCount} text{textCount === 1 ? "" : "s"} · {sentenceCount} sentence
          {sentenceCount === 1 ? "" : "s"}
        </p>
      ) : null}
    </header>
  );
}
