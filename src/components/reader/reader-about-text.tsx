import type { TextIntroduction } from "@/lib/reader/build-text-introduction";

type ReaderAboutTextProps = {
  introduction: TextIntroduction | null;
};

export function ReaderAboutText({ introduction }: ReaderAboutTextProps) {
  if (!introduction) {
    return null;
  }

  const focusPoints = introduction.focusPoints.slice(0, 3);

  return (
    <section className="max-w-[70ch] space-y-3">
      <p className="home-section-label">About this text</p>
      <p className="line-clamp-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
        {introduction.summary}
      </p>
      {focusPoints.length > 0 ? (
        <div>
          <p className="text-xs text-[var(--ink-muted)]">Focus</p>
          <ul className="mt-1.5 space-y-1 text-sm text-[var(--ink-secondary)]">
            {focusPoints.map((point) => (
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
    </section>
  );
}
