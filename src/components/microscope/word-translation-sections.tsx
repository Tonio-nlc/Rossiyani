"use client";

import type { ReactNode } from "react";

import type { WordTranslationDisplay } from "@/lib/formatting/resolve-word-translation-display";
import { translationSourceBadgeLabel } from "@/lib/formatting/resolve-word-translation-display";

type WordTranslationSectionProps = {
  translation: WordTranslationDisplay;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
      {children}
    </p>
  );
}

function TranslationBadge({
  isEstimated,
  source,
}: {
  isEstimated: boolean;
  source: WordTranslationDisplay["source"];
}) {
  const label = translationSourceBadgeLabel(source, isEstimated);
  if (!label) {
    return null;
  }
  return (
    <span
      className={[
        "ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wide",
        isEstimated
          ? "bg-amber-500/10 text-amber-200/90"
          : "bg-emerald-500/10 text-emerald-200/90",
      ].join(" ")}
    >
      {translationSourceBadgeLabel(source, isEstimated)}
    </span>
  );
}

export function WordTranslationSection({ translation }: WordTranslationSectionProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-1">
        <SectionLabel>Traduction</SectionLabel>
        <TranslationBadge
          isEstimated={translation.isEstimated}
          source={translation.source}
        />
      </div>
      <ul className="mt-1 space-y-0.5">
        {translation.primaryMeanings.map((meaning) => (
          <li
            key={meaning}
            className="font-reader text-base font-medium leading-snug text-[var(--accent-cyan-bright)]"
          >
            {translation.posEmoji ? (
              <span className="mr-1.5" aria-hidden>
                {translation.posEmoji}
              </span>
            ) : null}
            {meaning}
          </li>
        ))}
        {translation.extraMeanings.length > 0 ? (
          <li className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
            {translation.extraMeanings.map((meaning) => (
              <span
                key={meaning}
                className="text-sm leading-snug text-[var(--accent-cyan)]/90"
              >
                {meaning}
              </span>
            ))}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
