import Link from "next/link";

export function HomeWelcome() {
  return (
    <section className="flex min-h-[calc(100dvh-var(--header-height)-2rem)] flex-col justify-center py-[var(--layout-gap)]">
      <p className="home-section-label">Welcome to Rossiyani</p>

      <h1 className="mt-6 max-w-2xl font-reader text-[clamp(2rem,5vw,3rem)] leading-[1.08] tracking-tight text-[var(--ink)]">
        Learn Russian through real texts and native language patterns.
      </h1>

      <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--ink-secondary)]">
        Every sentence you read expands your personal linguistic graph.
      </p>

      <div className="mt-10">
        <Link
          href="/import"
          className="focus-kb inline-flex items-center justify-center bg-[var(--ink)] px-8 py-3.5 text-sm font-medium text-[var(--paper)] transition hover:opacity-90"
        >
          Import your first text
        </Link>
      </div>
    </section>
  );
}
