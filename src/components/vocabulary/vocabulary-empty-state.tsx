import { EmptyState } from "@/components/design-system";

import type { VocabularyTab } from "@/lib/vocabulary";

type VocabularyEmptyStateProps = {
  title: string;
  lead: string;
  ctaHref: string;
  ctaLabel: string;
  tone?: VocabularyTab;
};

const TONE_EYEBROW: Record<VocabularyTab, string> = {
  words: "Mots",
  expressions: "Expressions",
  sentences: "Phrases",
};

export function VocabularyEmptyState({
  title,
  lead,
  ctaHref,
  ctaLabel,
  tone = "words",
}: VocabularyEmptyStateProps) {
  return (
    <EmptyState
      className={`vocabulary-empty vocabulary-empty--${tone}`}
      eyebrow={TONE_EYEBROW[tone]}
      title={title}
      description={lead}
      action={{ label: ctaLabel, href: ctaHref }}
    />
  );
}
