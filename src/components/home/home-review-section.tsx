import Link from "next/link";

import type { HomeReviewToday } from "@/features/home";
import { reviewTodayRationale } from "@/lib/home/session-rationale";

import { HomeSessionCard } from "./home-session-card";

type HomeReviewSectionProps = {
  review: HomeReviewToday;
  reviewHref: string;
};

export function HomeReviewSection({ review, reviewHref }: HomeReviewSectionProps) {
  const seedLemma = review.words[0]?.label;
  const rationale = reviewTodayRationale(seedLemma);

  return (
    <HomeSessionCard label="Révision du jour" rationale={rationale}>
      {review.words.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {review.words.map((word) => (
            <Link
              key={word.href}
              href={word.href}
              className="focus-kb inline-flex items-center gap-1 rounded-full border border-[var(--hairline)] px-3 py-1.5 font-reader text-sm text-[var(--ink)] transition hover:border-[var(--hairline-strong)]"
            >
              {word.label}
              {word.count ? (
                <span className="text-[var(--ink-muted)]">×{word.count}</span>
              ) : null}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--ink-muted)]">Aucun mot en attente pour l&apos;instant.</p>
      )}

      {review.moreCount > 0 ? (
        <Link
          href={reviewHref}
          className="focus-kb mt-3 inline-block text-sm text-[var(--ink-secondary)] hover:text-[var(--ink)]"
        >
          +{review.moreCount} de plus
        </Link>
      ) : null}

      <div className="mt-5">
        <Link
          href={reviewHref}
          className="focus-kb inline-flex items-center justify-center border border-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)]"
        >
          Réviser les mots du jour →
        </Link>
      </div>
    </HomeSessionCard>
  );
}
