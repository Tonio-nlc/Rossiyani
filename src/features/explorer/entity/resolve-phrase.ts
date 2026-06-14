import type { PhraseGroupType } from "@prisma/client";

import { PHRASE_GROUP_TYPE_LABELS } from "@/types/domain";
import { getPhraseKnowledge } from "@/features/knowledge/get-phrase-knowledge";
import { phraseLookupKey } from "@/lib/normalization/russian-key";

import {
  findCuratedCandidateExact,
  findCuratedCandidateFuzzy,
} from "./curated-lookup";
import { findPhraseRowFuzzy } from "./fuzzy-match";
import { curatedCandidateHref, phraseRouteForType } from "./paths";
import type { PhraseRouteHint, ResolvedPhraseEntity } from "./types";

export type PhraseEntityResolution = ResolvedPhraseEntity & {
  knowledge: Awaited<ReturnType<typeof getPhraseKnowledge>>;
  curated: ReturnType<typeof findCuratedCandidateExact>;
  requestedLabel: string;
};

function routeHintFromPhraseType(type: PhraseGroupType | string): PhraseRouteHint {
  return type === "COLLOCATION" ? "collocation" : "expression";
}

function routeHintFromRoute(routeKind?: PhraseRouteHint): PhraseRouteHint {
  return routeKind ?? "expression";
}

function canonicalPathForPhrase(
  label: string,
  type: string,
  routeKind?: PhraseRouteHint,
): string {
  return phraseRouteForType(label, type, routeHintFromPhraseType(type) ?? routeKind);
}

export async function resolvePhraseEntity(
  rawLabel: string,
  options?: { routeKind?: PhraseRouteHint },
): Promise<PhraseEntityResolution | null> {
  const requestedLabel = decodeURIComponent(rawLabel).trim();
  if (!requestedLabel) {
    return null;
  }

  const routeKind = routeHintFromRoute(options?.routeKind);

  let knowledge = await getPhraseKnowledge(requestedLabel);
  if (knowledge) {
    return {
      requestedLabel,
      canonicalLabel: knowledge.label,
      canonicalPath: canonicalPathForPhrase(knowledge.label, knowledge.type, routeKind),
      routeHint: routeHintFromPhraseType(knowledge.type),
      knowledge,
      curated: null,
    };
  }

  const fuzzyRow = await findPhraseRowFuzzy(requestedLabel);
  if (fuzzyRow) {
    knowledge = await getPhraseKnowledge(fuzzyRow.label);
    if (knowledge) {
      return {
        requestedLabel,
        canonicalLabel: knowledge.label,
        canonicalPath: canonicalPathForPhrase(knowledge.label, knowledge.type, routeKind),
        routeHint: routeHintFromPhraseType(knowledge.type),
        knowledge,
        curated: null,
      };
    }
  }

  let curated = findCuratedCandidateExact(requestedLabel);
  if (!curated) {
    curated = findCuratedCandidateFuzzy(requestedLabel);
  }

  if (curated) {
    return {
      requestedLabel,
      canonicalLabel: curated.lemma,
      canonicalPath: curatedCandidateHref(curated),
      routeHint:
        curated.type === "COLLOCATION" || routeKind === "collocation"
          ? "collocation"
          : "expression",
      knowledge: null,
      curated,
    };
  }

  return null;
}

export function phraseTypeLabel(type: string): string {
  if (type in PHRASE_GROUP_TYPE_LABELS) {
    return PHRASE_GROUP_TYPE_LABELS[type as keyof typeof PHRASE_GROUP_TYPE_LABELS];
  }
  return type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function labelsEquivalent(a: string, b: string): boolean {
  return phraseLookupKey(a) === phraseLookupKey(b);
}
