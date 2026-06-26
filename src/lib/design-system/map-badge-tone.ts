import type { BadgeTone } from "@/components/design-system/badge";
import type { VocabularyBadgeTone } from "@/lib/vocabulary";

export function mapVocabularyBadgeTone(tone: VocabularyBadgeTone): BadgeTone {
  switch (tone) {
    case "blue":
      return "blue";
    case "green":
    case "teal":
      return "green";
    case "violet":
      return "violet";
    case "gold":
      return "amber";
    case "rose":
      return "rose";
  }
  return "neutral";
}
