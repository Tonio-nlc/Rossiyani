import type { FeaturedCandidateType } from "@prisma/client";

import { getSavedDiscoveries } from "@/lib/discovery/saved-discoveries";

import { createBadge, vocabularyExpressionPath } from "./card-utils";
import type { VocabularyExpression } from "./types";

const EXPRESSION_TYPES = new Set<FeaturedCandidateType>([
  "EXPRESSION",
  "COLLOCATION",
  "CONSTRUCTION",
  "NATIVE_PHRASE",
  "SLANG",
  "CONVERSATION",
  "REGIONAL",
]);

export function loadVocabularyExpressions(): VocabularyExpression[] {
  const seen = new Set<string>();
  const expressions: VocabularyExpression[] = [];

  for (const discovery of getSavedDiscoveries()) {
    if (!EXPRESSION_TYPES.has(discovery.type)) {
      continue;
    }

    const key = discovery.displayLabel.trim().toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);

    const badges = [
      createBadge("type-expression", "Expression", "violet"),
      ...(discovery.difficulty
        ? [createBadge(`cefr-${discovery.difficulty}`, discovery.difficulty, "gold")]
        : []),
    ];

    expressions.push({
      id: discovery.id,
      russian: discovery.displayLabel,
      translation: discovery.subtitle,
      meaning: discovery.explanation,
      exampleRussian: discovery.exampleRussian,
      exampleTranslation: discovery.exampleTranslation,
      level: discovery.difficulty,
      savedAt: discovery.savedAt,
      source: "discovery",
      detailHref: vocabularyExpressionPath(discovery.id),
      badges,
    });
  }

  return expressions.sort(
    (left, right) => new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime(),
  );
}
