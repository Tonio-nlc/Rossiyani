import Link from "next/link";

import type { HomeReviewToday } from "@/features/home";

type HomeReviewSectionProps = {
  review: HomeReviewToday;
  reviewHref: string;
};

export function HomeReviewSection({ review, reviewHref }: HomeReviewSectionProps) {
  return (
    <section>
      <p className="home-section-label">To review today</p>

      {review.words.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
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
        <p className="mt-4 text-sm text-[var(--ink-muted)]">No words queued yet.</p>
      )}

      {review.moreCount > 0 ? (
        <Link
          href={reviewHref}
          className="focus-kb mt-3 inline-block text-sm text-[var(--ink-secondary)] hover:text-[var(--ink)]"
        >
          +{review.moreCount} more
        </Link>
      ) : null}

      <div className="mt-5">
        <Link
          href={reviewHref}
          className="focus-kb inline-flex items-center justify-center bg-[var(--ink)] px-6 py-3 text-sm font-medium text-[var(--paper)] transition hover:opacity-90"
        >
          Review today&apos;s words →
        </Link>
      </div>
    </section>
  );
}
