import type { CefrLevel, Register } from "@prisma/client";

import type { FeaturedCandidateRow } from "@/features/discovery/types";
import type { PhraseKnowledge } from "@/types/knowledge-graph";

import {
  buildMetadataLine,
  buildWhyItMatters,
  firstSentence,
  frequencyLabelFromCount,
  frequencyLabelFromScore,
  registerBadge,
  type ExplorerEntityBadge,
  type ExplorerEntityPageData,
  type ExplorerEntityPick,
} from "./types";

function buildBadges(options: {
  cefr?: CefrLevel | string | null;
  frequencyLabel?: string;
  register?: Register | string | null;
}): ExplorerEntityBadge[] {
  const badges: ExplorerEntityBadge[] = [];
  if (options.cefr) {
    badges.push({ label: String(options.cefr) });
  }
  if (options.frequencyLabel) {
    badges.push({ label: options.frequencyLabel });
  }
  if (options.register) {
    const register = registerBadge(options.register);
    if (register) {
      badges.push({ label: register });
    }
  }
  return badges;
}

function enrichPickWithReason(
  pick: ExplorerEntityPick,
  reason: string,
): ExplorerEntityPick {
  return { ...pick, reason };
}

export function enrichPhraseKnowledgePage(
  page: ExplorerEntityPageData,
  knowledge: PhraseKnowledge,
): ExplorerEntityPageData {
  const frequencyLabel = frequencyLabelFromCount(knowledge.occurrenceCount);
  const description =
    knowledge.canonicalExplanation?.trim() || page.description;
  const heroSummary = firstSentence(description);

  const relatedWithReasons = page.relatedExpressions.map((pick) =>
    enrichPickWithReason(pick, "Similar meaning"),
  );
  const grammarWithReasons = page.relatedGrammar.map((pick) =>
    enrichPickWithReason(pick, "Grammar neighbour"),
  );

  return {
    ...page,
    typeLabel: page.typeLabel,
    badges: buildBadges({ frequencyLabel }),
    heroSummary,
    description,
    whyItMatters: buildWhyItMatters(knowledge.label, page.typeLabel, frequencyLabel),
    usageNotes:
      knowledge.seenInTexts > 0
        ? `Appears in ${knowledge.seenInTexts} text${knowledge.seenInTexts > 1 ? "s" : ""} across your library.`
        : undefined,
    textCount: knowledge.seenInTexts,
    relatedExpressions: relatedWithReasons.map((pick) => ({
      ...pick,
      typeBadge: pick.meta,
    })),
    relatedGrammar: grammarWithReasons,
    continueExploring: prioritizeRecommendations(
      relatedWithReasons,
      grammarWithReasons,
      page.continueExploring,
    ),
  };
}

export function enrichCuratedPage(
  page: ExplorerEntityPageData,
  curated: FeaturedCandidateRow,
): ExplorerEntityPageData {
  const frequencyLabel = frequencyLabelFromScore(curated.frequency);
  const description = curated.explanation?.trim() || page.description;
  const heroSummary = firstSentence(description);
  const topics = Array.isArray(curated.topics)
    ? curated.topics.filter((topic): topic is string => typeof topic === "string")
    : [];

  const relatedWithReasons = page.relatedExpressions.map((pick) =>
    enrichPickWithReason(
      pick,
      pick.meta ? "Commonly learned together" : "Similar meaning",
    ),
  );

  return {
    ...page,
    badges: buildBadges({
      cefr: curated.difficulty as CefrLevel,
      frequencyLabel,
      register: curated.register as Register,
    }),
    heroSummary,
    description,
    whyItMatters: buildWhyItMatters(curated.lemma, page.typeLabel, frequencyLabel),
    usageNotes:
      topics.length > 0 ? `Often appears in: ${topics.join(", ")}.` : undefined,
    textCount: page.textCount,
    relatedExpressions: relatedWithReasons.map((pick) => ({
      ...pick,
      translation: pick.translation ?? pick.meta,
      typeBadge: pick.typeBadge ?? pick.meta,
    })),
    continueExploring: prioritizeRecommendations(
      relatedWithReasons,
      page.relatedGrammar.map((pick) => enrichPickWithReason(pick, "Grammar neighbour")),
      page.continueExploring,
    ),
  };
}

export function enrichLemmaCuratedPage(
  page: ExplorerEntityPageData,
  curated: FeaturedCandidateRow,
): ExplorerEntityPageData {
  return enrichCuratedPage(page, curated);
}

export function enrichConceptPage(page: ExplorerEntityPageData): ExplorerEntityPageData {
  const heroSummary = firstSentence(page.description);
  return {
    ...page,
    badges: page.badges.length > 0 ? page.badges : [{ label: "Grammar" }],
    heroSummary,
    whyItMatters: buildWhyItMatters(page.label, page.typeLabel),
    relatedGrammar: page.relatedGrammar.map((pick) =>
      enrichPickWithReason(pick, "Grammar neighbour"),
    ),
    continueExploring: prioritizeRecommendations(
      page.relatedExpressions.map((pick) => enrichPickWithReason(pick, "Similar meaning")),
      page.relatedGrammar.map((pick) => enrichPickWithReason(pick, "Grammar neighbour")),
      page.continueExploring,
    ),
  };
}

function prioritizeRecommendations(
  similar: ExplorerEntityPick[],
  grammar: ExplorerEntityPick[],
  fallback: ExplorerEntityPick[],
): ExplorerEntityPick[] {
  const ordered: ExplorerEntityPick[] = [];
  const seen = new Set<string>();

  const add = (pick: ExplorerEntityPick) => {
    if (seen.has(pick.href)) {
      return;
    }
    seen.add(pick.href);
    ordered.push(pick);
  };

  for (const pick of similar.slice(0, 2)) {
    add(pick);
  }
  for (const pick of grammar.slice(0, 2)) {
    add(pick);
  }
  for (const pick of fallback) {
    if (ordered.length >= 4) {
      break;
    }
    add({
      ...pick,
      reason: pick.reason ?? "Editor's pick",
    });
  }

  return ordered.slice(0, 4);
}

export function basePageFields(
  typeLabel: string,
  cefr?: CefrLevel | string | null,
): Pick<ExplorerEntityPageData, "typeLabel" | "metadataLine" | "badges" | "textCount"> {
  return {
    typeLabel,
    metadataLine: buildMetadataLine(typeLabel, cefr),
    badges: buildBadges({ cefr }),
    textCount: 0,
  };
}
