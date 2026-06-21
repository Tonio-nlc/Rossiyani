"use client";

import Link from "next/link";

import type { ReadingSessionContinueAction } from "@/lib/reader/build-reading-session-summary";

type ReaderCompletionCardProps = {
  textTitle: string;
  continueActions: ReadingSessionContinueAction[];
};

export function ReaderCompletionCard({
  textTitle,
  continueActions,
}: ReaderCompletionCardProps) {
  return (
    <section className="reader-end">
      <p className="reader-end__message">
        <span className="reader-end__check" aria-hidden>
          ✓
        </span>
        Lecture terminée · {textTitle}
      </p>

      {continueActions.length > 0 ? (
        <ul className="reader-end__actions">
          {continueActions.map((action) => (
            <li key={`${action.href}-${action.label}`}>
              <Link href={action.href} className="reader-end__action focus-kb">
                <span className="reader-end__action-label">{action.label}</span>
                <span className="reader-end__action-rationale">{action.rationale}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
