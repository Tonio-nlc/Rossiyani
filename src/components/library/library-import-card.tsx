import Link from "next/link";

const actionClass =
  "focus-kb text-sm text-[var(--ink)] underline-offset-2 transition hover:text-[var(--ink-secondary)] hover:underline";

export function LibraryImportCard() {
  return (
    <section className="rounded-2xl border border-[var(--hairline)] px-5 py-4 sm:px-6 sm:py-5">
      <p className="home-section-label">Import a new text</p>
      <p className="mt-1.5 max-w-xl text-sm leading-snug text-[var(--ink-secondary)]">
        Create a fully interactive Rossiyani reading experience from your own content.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1">
        <Link href="/import#paste" className={actionClass}>
          Paste text
        </Link>
        <Link href="/import#file" className={actionClass}>
          Upload
        </Link>
      </div>

      <p className="mt-2.5">
        <Link
          href="/import#history"
          className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline"
        >
          Recent imports →
        </Link>
      </p>
    </section>
  );
}
