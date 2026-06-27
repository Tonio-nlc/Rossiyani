import type { TextListItem } from "@/features/texts";
import { isDisplayableLibraryText } from "@/lib/home/displayable-text";

import { LEARNER_LEVEL_OPTIONS, type LearnerLevel } from "./types";

function levelTargets(level: LearnerLevel): Array<"A1" | "A2" | "B1"> {
  return LEARNER_LEVEL_OPTIONS.find((option) => option.id === level)?.cefrTargets ?? ["A1"];
}

export function pickFirstOnboardingText(
  texts: TextListItem[],
  level: LearnerLevel,
): TextListItem | null {
  const displayable = texts.filter(isDisplayableLibraryText);
  if (displayable.length === 0) {
    return null;
  }

  const targets = levelTargets(level);

  for (const cefr of targets) {
    const matches = displayable
      .filter((text) => text.level === cefr)
      .sort((left, right) => left.sentenceCount - right.sentenceCount);
    if (matches[0]) {
      return matches[0];
    }
  }

  return (
    displayable
      .filter((text) => text.level === "A1")
      .sort((left, right) => left.sentenceCount - right.sentenceCount)[0] ?? displayable[0]
  );
}
