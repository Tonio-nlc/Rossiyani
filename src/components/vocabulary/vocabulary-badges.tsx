import { Badge } from "@/components/design-system";
import { mapVocabularyBadgeTone } from "@/lib/design-system/map-badge-tone";
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
        <Badge key={badge.id} tone={mapVocabularyBadgeTone(badge.tone)}>
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
