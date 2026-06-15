"use client";

import { useState } from "react";

import type { TextIntroduction } from "@/lib/reader/build-text-introduction";

type ReaderAboutTextProps = {
  introduction: TextIntroduction | null;
  defaultCollapsed?: boolean;
};

export function ReaderAboutText({
  introduction,
  defaultCollapsed = true,
}: ReaderAboutTextProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (!introduction) {
    return null;
  }

  const focusPoints = introduction.focusPoints.slice(0, 3);

  return (
    <section className="max-w-[70ch] border-t border-[var(--hairline)] pt-8">
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="focus-kb flex w-full items-center gap-2 text-left"
        aria-expanded={!collapsed}
      >
        <span className="home-section-label">About this text</span>
        <span className="text-xs text-[var(--ink-muted)]" aria-hidden>
          {collapsed ? "▼" : "▲"}
        </span>
      </button>

      {!collapsed ? (
        <div className="mt-4 space-y-4 animate-sentence-translation-fade">
          {introduction.summary ? (
            <div>
              <p className="text-xs text-[var(--ink-muted)]">Theme</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ink-secondary)]">
                {introduction.summary}
              </p>
            </div>
          ) : null}

          {focusPoints.length > 0 ? (
            <div>
              <p className="text-xs text-[var(--ink-muted)]">Focus vocabulary</p>
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

          <p className="text-xs text-[var(--ink-muted)]">
            Estimated reading time · {introduction.readMinutes} min
          </p>
        </div>
      ) : null}
    </section>
  );
}
