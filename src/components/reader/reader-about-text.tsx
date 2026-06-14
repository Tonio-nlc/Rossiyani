import type { TextIntroduction } from "@/lib/reader/build-text-introduction";

type ReaderAboutTextProps = {
  introduction: TextIntroduction | null;
};

export function ReaderAboutText({ introduction }: ReaderAboutTextProps) {
  if (!introduction) {
    return null;
  }

  return (
    <section className="max-w-[var(--reading-max)] border-b border-[var(--hairline)] pb-4">
      <p className="home-section-label">About this text</p>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        {introduction.summary}
      </p>
      {introduction.focusPoints.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs text-[var(--ink-muted)]">Focus</p>
          <ul className="mt-1.5 space-y-1 text-sm text-[var(--ink-secondary)]">
            {introduction.focusPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-[var(--ink-muted)]" aria-hidden>
                  •
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-3 text-xs text-[var(--ink-muted)]">
        {introduction.readMinutes} min read
      </p>
    </section>
  );
}
