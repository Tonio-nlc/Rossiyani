import type { PartOfSpeech } from "@prisma/client";

import { lemmaPath } from "@/components/explorer/explorer-routes";
import { getLemmaKnowledge } from "@/features/knowledge/get-lemma-knowledge";
import type { LemmaKnowledge } from "@/types/knowledge-graph";

import {
  findCuratedCandidateExact,
  findCuratedCandidateFuzzy,
} from "./curated-lookup";
import { findLemmaRowFuzzy } from "./fuzzy-match";
import { curatedCandidateHref, partOfSpeechFallback } from "./paths";
import type { FeaturedCandidateRow } from "@/features/discovery/types";

const POS_FALLBACK: PartOfSpeech[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
];

export type LemmaEntityResolution = {
  requestedLemma: string;
  canonicalLemma: string;
  canonicalPath: string;
  partOfSpeech: PartOfSpeech;
  knowledge: LemmaKnowledge | null;
  curated: FeaturedCandidateRow | null;
};

async function loadLemmaKnowledge(
  lemma: string,
  preferredPos?: PartOfSpeech,
): Promise<{ knowledge: LemmaKnowledge; partOfSpeech: PartOfSpeech } | null> {
  if (preferredPos) {
    const knowledge = await getLemmaKnowledge(lemma, preferredPos);
    if (knowledge) {
      return { knowledge, partOfSpeech: preferredPos };
    }
  }

  for (const pos of POS_FALLBACK) {
    if (preferredPos && pos === preferredPos) {
      continue;
    }
    const knowledge = await getLemmaKnowledge(lemma, pos);
    if (knowledge) {
      return { knowledge, partOfSpeech: pos };
    }
  }

  return null;
}

export async function resolveLemmaEntity(
  rawLemma: string,
  preferredPos?: PartOfSpeech,
): Promise<LemmaEntityResolution | null> {
  const requestedLemma = decodeURIComponent(rawLemma).trim();
  if (!requestedLemma) {
    return null;
  }

  const loaded = await loadLemmaKnowledge(requestedLemma, preferredPos);
  if (loaded) {
    return {
      requestedLemma,
      canonicalLemma: loaded.knowledge.lemma,
      canonicalPath: lemmaPath(loaded.knowledge.lemma, loaded.partOfSpeech),
      partOfSpeech: loaded.partOfSpeech,
      knowledge: loaded.knowledge,
      curated: null,
    };
  }

  const fuzzyRow = await findLemmaRowFuzzy(requestedLemma);
  if (fuzzyRow) {
    const fuzzyLoaded = await loadLemmaKnowledge(fuzzyRow.lemma, fuzzyRow.partOfSpeech);
    if (fuzzyLoaded) {
      return {
        requestedLemma,
        canonicalLemma: fuzzyLoaded.knowledge.lemma,
        canonicalPath: lemmaPath(fuzzyLoaded.knowledge.lemma, fuzzyLoaded.partOfSpeech),
        partOfSpeech: fuzzyLoaded.partOfSpeech,
        knowledge: fuzzyLoaded.knowledge,
        curated: null,
      };
    }
  }

  const curated =
    findCuratedCandidateExact(requestedLemma) ??
    findCuratedCandidateFuzzy(requestedLemma);
  if (curated && curated.type === "WORD") {
    const pos = partOfSpeechFallback(curated.partOfSpeech ?? preferredPos);
    return {
      requestedLemma,
      canonicalLemma: curated.lemma,
      canonicalPath: curatedCandidateHref(curated),
      partOfSpeech: pos,
      knowledge: null,
      curated,
    };
  }

  return null;
}
