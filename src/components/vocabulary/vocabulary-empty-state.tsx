import Link from "next/link";

import type { VocabularyTab } from "@/lib/vocabulary";

type VocabularyEmptyStateProps = {
  title: string;
  lead: string;
  ctaHref: string;
  ctaLabel: string;
  tone?: VocabularyTab;
};

export function VocabularyEmptyState({
  title,
  lead,
  ctaHref,
  ctaLabel,
  tone = "words",
}: VocabularyEmptyStateProps) {
  return (
    <div className={["vocabulary-empty", `vocabulary-empty--${tone}`].join(" ")}>
      <h3 className="vocabulary-empty__title">{title}</h3>
      <p className="vocabulary-empty__lead">{lead}</p>
      <Link href={ctaHref} className="vocabulary-empty__cta focus-kb">
        {ctaLabel}
      </Link>
    </div>
  );
}
