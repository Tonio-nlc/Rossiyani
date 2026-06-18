import Link from "next/link";

import type { SessionJournalEntry } from "@/lib/home/build-session-journal";

type HomeJournalChapterProps = {
  title: string;
  entries: SessionJournalEntry[];
  primary?: boolean;
  emptyMessage?: string;
};

export function HomeJournalChapter({
  title,
  entries,
  primary = false,
  emptyMessage,
}: HomeJournalChapterProps) {
  return (
    <section
      className={[
        primary
          ? "border border-[var(--ink)] bg-[var(--paper)] px-6 py-6"
          : "border-b border-[var(--hairline)] pb-8",
      ].join(" ")}
    >
      <h2 className="font-reader text-[clamp(1.125rem,2vw,1.25rem)] leading-snug text-[var(--ink)]">
        {title}
      </h2>

      {entries.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {entries.map((entry) => (
            <li key={`${entry.label}-${entry.href ?? entry.detail ?? ""}`}>
              {entry.href ? (
                <Link
                  href={entry.href}
                  className="focus-kb group block transition hover:text-[var(--color-link)]"
                >
                  <span className="break-russian font-reader text-base text-[var(--ink)] group-hover:text-[var(--color-link)]">
                    {entry.label}
                  </span>
                  {entry.detail ? (
                    <span className="mt-0.5 block text-sm leading-relaxed text-[var(--ink-muted)]">
                      {entry.detail}
                    </span>
                  ) : null}
                </Link>
              ) : (
                <div>
                  <span className="break-russian font-reader text-base text-[var(--ink)]">
                    {entry.label}
                  </span>
                  {entry.detail ? (
                    <span className="mt-0.5 block text-sm leading-relaxed text-[var(--ink-muted)]">
                      {entry.detail}
                    </span>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : emptyMessage ? (
        <p className="mt-4 text-sm leading-relaxed text-[var(--ink-muted)]">{emptyMessage}</p>
      ) : null}
    </section>
  );
}
