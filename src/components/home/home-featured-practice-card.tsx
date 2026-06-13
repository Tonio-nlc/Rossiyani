import Link from "next/link";

import type { HomeFeaturedPractice } from "@/features/home";

type HomeFeaturedPracticeCardProps = {
  practice: HomeFeaturedPractice;
};

export function HomeFeaturedPracticeCard({ practice }: HomeFeaturedPracticeCardProps) {
  return (
    <Link
      href={practice.href}
      className="focus-kb group block border border-[var(--hairline)] px-4 py-4 transition hover:border-[var(--hairline-strong)]"
    >
      <p className="home-section-label">Featured practice</p>
      <h3 className="mt-2 font-reader text-lg leading-snug text-[var(--ink)] group-hover:text-[var(--color-link)]">
        {practice.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
        {practice.description}
      </p>
      <p className="mt-2 text-metadata text-[var(--ink-muted)]">{practice.estimatedMinutes} min</p>
      <p className="mt-2 text-sm text-[var(--ink-secondary)] group-hover:text-[var(--color-link)]">
        Start practice →
      </p>
    </Link>
  );
}
