import Link from "next/link";

import type { HomeReviewToday } from "@/features/home";

type HomeReviewSectionProps = {
  review: HomeReviewToday;
  srsHref: string;
};

export function HomeReviewSection({ review, srsHref }: HomeReviewSectionProps) {
  if (review.totalCount === 0) {
    return null;
  }

  return (
    <section>
      <p className="home-section-label">To review today</p>

      <p className="mt-4 font-reader text-[clamp(1.75rem,4vw,2.25rem)] leading-none tracking-tight text-[var(--ink)]">
        {review.totalCount} cards waiting
      </p>

      {review.words.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {review.words.map((word) => (
            <li key={word.href}>
              <Link
                href={word.href}
                className="focus-kb font-reader text-sm tracking-[0.12em] text-[var(--ink-secondary)] transition hover:text-[var(--ink)]"
              >
                {word.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-8">
        <Link
          href={srsHref}
          className="focus-kb inline-flex items-center justify-center bg-[var(--ink)] px-8 py-3.5 text-sm font-medium text-[var(--paper)] transition hover:opacity-90"
        >
          Continue SRS →
        </Link>
      </div>
    </section>
  );
}
