import { conceptPath } from "@/components/explorer/explorer-routes";
import { getConceptKnowledge } from "@/features/knowledge/get-concept-knowledge";
import type { ConceptKnowledge } from "@/types/knowledge-graph";
import type { FeaturedCandidateRow } from "@/features/discovery/types";

import {
  findCuratedCandidateExact,
  findCuratedCandidateFuzzy,
} from "./curated-lookup";
import { findConceptRowFuzzy } from "./fuzzy-match";
import { curatedCandidateHref } from "./paths";

export type ConceptEntityResolution = {
  requestedKey: string;
  canonicalKey: string;
  canonicalTitle: string;
  canonicalPath: string;
  knowledge: ConceptKnowledge | null;
  curated: FeaturedCandidateRow | null;
};

export async function resolveConceptEntity(
  rawKey: string,
): Promise<ConceptEntityResolution | null> {
  const requestedKey = decodeURIComponent(rawKey).trim();
  if (!requestedKey) {
    return null;
  }

  let knowledge = await getConceptKnowledge(requestedKey);
  if (knowledge) {
    return {
      requestedKey,
      canonicalKey: knowledge.concept.conceptKey,
      canonicalTitle: knowledge.concept.title,
      canonicalPath: conceptPath(knowledge.concept.conceptKey),
      knowledge,
      curated: null,
    };
  }

  const fuzzyRow = await findConceptRowFuzzy(requestedKey);
  if (fuzzyRow) {
    knowledge = await getConceptKnowledge(fuzzyRow.conceptKey);
    if (knowledge) {
      return {
        requestedKey,
        canonicalKey: knowledge.concept.conceptKey,
        canonicalTitle: knowledge.concept.title,
        canonicalPath: conceptPath(knowledge.concept.conceptKey),
        knowledge,
        curated: null,
      };
    }
  }

  const curated =
    findCuratedCandidateExact(requestedKey) ?? findCuratedCandidateFuzzy(requestedKey);
  if (curated && (curated.type === "GRAMMAR" || curated.type === "CONSTRUCTION")) {
    return {
      requestedKey,
      canonicalKey: curated.lemma,
      canonicalTitle: curated.lemma,
      canonicalPath: curatedCandidateHref(curated),
      knowledge: null,
      curated,
    };
  }

  return null;
}
