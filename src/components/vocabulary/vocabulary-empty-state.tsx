import Link from "next/link";

type VocabularyEmptyStateProps = {
  title: string;
  lead: string;
  ctaHref: string;
  ctaLabel: string;
};

export function VocabularyEmptyState({ title, lead, ctaHref, ctaLabel }: VocabularyEmptyStateProps) {
  return (
    <div className="vocabulary-empty">
      <h3 className="vocabulary-empty__title">{title}</h3>
      <p className="vocabulary-empty__lead">{lead}</p>
      <Link href={ctaHref} className="vocabulary-empty__cta focus-kb">
        {ctaLabel}
      </Link>
    </div>
  );
}
