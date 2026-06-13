import Link from "next/link";

export function HomePracticeSection() {
  return (
    <section>
      <p className="home-section-label">Practice</p>

      <div className="mt-4 border border-[var(--hairline)] px-4 py-4">
        <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
          Transform thoughts into natural Russian — understand how a native would phrase your ideas.
        </p>
        <Link
          href="/practice"
          className="focus-kb mt-3 inline-block text-sm font-medium text-[var(--ink)] hover:text-[var(--color-link)]"
        >
          Open Practice →
        </Link>
      </div>
    </section>
  );
}
