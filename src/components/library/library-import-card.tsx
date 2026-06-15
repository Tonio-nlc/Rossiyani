import Link from "next/link";

const actionClass =
  "focus-kb text-sm text-[var(--ink)] underline-offset-2 transition hover:text-[var(--ink-secondary)] hover:underline";

export function LibraryImportCard() {
  return (
    <section className="rounded-2xl border border-[var(--hairline)] px-6 py-6 sm:px-8 sm:py-8">
      <p className="home-section-label">Import a new text</p>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        Create a fully interactive Rossiyani reading experience from your own content.
      </p>

      <ul className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
        <li>
          <Link href="/import#paste" className={actionClass}>
            Paste text
          </Link>
        </li>
        <li>
          <Link href="/import#file" className={actionClass}>
            Upload .txt
          </Link>
        </li>
        <li>
          <Link href="/import#file" className={actionClass}>
            Upload .md
          </Link>
        </li>
      </ul>

      <p className="mt-5 text-xs text-[var(--ink-muted)]">
        Supported: Russian · Ukrainian · Belarusian
      </p>

      <p className="mt-4">
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
