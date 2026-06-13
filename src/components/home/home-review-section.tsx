import Link from "next/link";

import type { HomeReviewToday } from "@/features/home";

type HomeReviewSectionProps = {
  review: HomeReviewToday;
};

export function HomeReviewSection({ review }: HomeReviewSectionProps) {
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
          href="/explorer/lemmas"
          className="focus-kb mt-3 inline-block text-sm text-[var(--ink-secondary)] hover:text-[var(--ink)]"
        >
          +{review.moreCount} more
        </Link>
      ) : null}
    </section>
  );
}
