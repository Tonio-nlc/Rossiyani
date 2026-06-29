import type { LearningPattern } from "@/types/patterns";
import type { ReaderPatternGuideCopy } from "@/types/reader-pattern-experience";

const HEADLINE_BY_PATTERN: Record<string, Pick<ReaderPatternGuideCopy, "headlineWithAnchor" | "headlineDefault">> = {
  "lp.verbs.present_conjugation.v1": {
    headlineWithAnchor: "Pourquoi « {{anchor}} » se termine ainsi ?",
    headlineDefault: "Pourquoi la fin du verbe change ?",
  },
  "lp.morphology.role_terminations.v1": {
    headlineWithAnchor: "Pourquoi « {{anchor}} » s'écrit ainsi ?",
    headlineDefault: "Pourquoi la même idée change de forme ?",
  },
  "lp.syntax.possession_existence.v1": {
    headlineWithAnchor: "Pourquoi « {{anchor}} » apparaît ici ?",
    headlineDefault: "Pourquoi « avoir » ne se dit pas comme en français ?",
  },
  "lp.foundation.stress_marks.v1": {
    headlineWithAnchor: "Que faut-il remarquer dans « {{anchor}} » ?",
    headlineDefault: "Que faut-il remarquer dans ce mot ?",
  },
};

const DEFAULT_LABELS: Omit<ReaderPatternGuideCopy, "headlineWithAnchor" | "headlineDefault"> = {
  noticeLead: "Regarde simplement.",
  comparePriorLabel: "Tu as déjà vu",
  compareCurrentLabel: "Aujourd'hui tu lis",
  noticeInvitation: "Regarde cette différence.",
  secondEncounter: "Tu as déjà rencontré cette différence. Observe-la.",
  exampleLabel: "Dans cette phrase",
};

/**
 * Builds Reader-facing guide labels from the Pattern Catalog.
 * Optional `readerGuide` on a pattern overrides defaults.
 */
export function buildReaderGuideCopy(pattern: LearningPattern): ReaderPatternGuideCopy {
  if (pattern.readerGuide) {
    return pattern.readerGuide;
  }

  const headlines = HEADLINE_BY_PATTERN[pattern.id];
  return {
    headlineWithAnchor: headlines?.headlineWithAnchor ?? "Pourquoi « {{anchor}} » ?",
    headlineDefault:
      headlines?.headlineDefault ??
      `Pourquoi ${pattern.userFacingName.charAt(0).toLowerCase()}${pattern.userFacingName.slice(1)} ?`,
    ...DEFAULT_LABELS,
  };
}

export function resolveGuideHeadline(copy: ReaderPatternGuideCopy, anchorText: string | null): string {
  if (anchorText?.trim()) {
    return copy.headlineWithAnchor.replace(/\{\{anchor\}\}/g, anchorText.trim());
  }
  return copy.headlineDefault;
}
