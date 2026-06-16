import Link from "next/link";

const cardClass =
  "focus-kb group block border border-[var(--hairline)] px-5 py-4 transition hover:border-[var(--ink-muted)]";

export function ContextTranslationEntryCard() {
  return (
    <Link href="/practice/context-translation" className={cardClass}>
      <p className="home-section-label">Context Translation</p>
      <p className="mt-2 font-reader text-lg text-[var(--ink)]">Think like a native speaker.</p>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        Translate, understand, compare and learn from one sentence.
      </p>
      <span className="mt-3 inline-block text-sm text-[var(--ink-muted)] group-hover:text-[var(--ink)]">
        Start →
      </span>
    </Link>
  );
}
