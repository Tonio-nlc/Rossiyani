import type { VocabularyBadge } from "@/lib/vocabulary";

type VocabularyBadgesProps = {
  badges: VocabularyBadge[];
  className?: string;
};

export function VocabularyBadges({ badges, className = "" }: VocabularyBadgesProps) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={["vocabulary-badges", className].filter(Boolean).join(" ")}>
      {badges.map((badge) => (
        <span
          key={badge.id}
          className={["vocabulary-badge", `vocabulary-badge--${badge.tone}`].join(" ")}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
