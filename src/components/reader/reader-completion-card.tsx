"use client";

import Link from "next/link";

import type {
  ReadingSessionContinueAction,
  ReadingSessionDiscovery,
} from "@/lib/reader/build-reading-session-summary";

type ReaderCompletionCardProps = {
  textTitle: string;
  discoveries: ReadingSessionDiscovery[];
  continueActions: ReadingSessionContinueAction[];
};

export function ReaderCompletionCard({
  textTitle,
  discoveries,
  continueActions,
}: ReaderCompletionCardProps) {
  return (
    <section className="max-w-[70ch] space-y-6 border-t border-[var(--hairline)] pt-8">
      <p className="text-sm text-[var(--ink-secondary)]">
        <span aria-hidden>✓ </span>
        Lecture terminée · {textTitle}
      </p>

      <div>
        <p className="home-section-label">Aujourd&apos;hui tu as découvert</p>
        {discoveries.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-secondary)]">
            {discoveries.map((item) => (
              <li key={item.label} className="flex flex-col gap-0.5">
                <span className="break-russian font-reader text-[var(--ink)]">{item.label}</span>
                {item.detail ? (
                  <span className="text-xs leading-relaxed text-[var(--ink-muted)]">
                    {item.detail}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
            Cliquez sur les mots surlignés pendant la lecture pour alimenter cette session.
          </p>
        )}
      </div>

      {continueActions.length > 0 ? (
        <div>
          <p className="home-section-label">Continuer</p>
          <ul className="mt-3 space-y-3">
            {continueActions.map((action) => (
              <li key={action.href}>
                <Link
                  href={action.href}
                  className="focus-kb group block transition hover:text-[var(--color-link)]"
                >
                  <span className="text-sm text-[var(--ink)] group-hover:text-[var(--color-link)]">
                    {action.label} →
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-[var(--ink-muted)]">
                    {action.rationale}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
