import {
  collocationPath,
  conceptPath,
  expressionPath,
  lemmaPath,
} from "@/components/explorer/explorer-routes";
import { getTodaysDiscovery } from "@/features/discovery/get-todays-discovery";
import { loadCuratedJsonCandidates } from "@/features/discovery/load-candidate-pool";
import type { FeaturedCandidateRow } from "@/features/discovery/types";
import type { TodaysDiscovery } from "@/features/discovery/types";

import { getKnowledgeCanvas, type KnowledgeCanvasData } from "./get-explorer-data";

export type ExplorerEditorialPick = {
  label: string;
  href: string;
  subtitle?: string;
};

export type ExplorerEditorialData = {
  todaysLanguage: TodaysDiscovery | null;
  popularConstructions: ExplorerEditorialPick[];
  nativeExpressions: ExplorerEditorialPick[];
  grammarSpotlight: KnowledgeCanvasData | null;
};

function candidateHref(candidate: FeaturedCandidateRow): string {
  if (candidate.explorerHref) {
    return candidate.explorerHref;
  }

  switch (candidate.type) {
    case "WORD":
      return lemmaPath(candidate.lemma, candidate.partOfSpeech ?? "noun");
    case "COLLOCATION":
      return collocationPath(candidate.lemma);
    case "GRAMMAR":
      return conceptPath(candidate.lemma);
    case "EXPRESSION":
    case "CONSTRUCTION":
    case "CONVERSATION":
    case "NATIVE_PHRASE":
    case "SLANG":
    case "REGIONAL":
      return expressionPath(candidate.lemma);
    default:
      return `/explorer?q=${encodeURIComponent(candidate.lemma)}`;
  }
}

function toPick(candidate: FeaturedCandidateRow): ExplorerEditorialPick {
  return {
    label: candidate.lemma,
    href: candidateHref(candidate),
    subtitle: candidate.subtitle || candidate.explanation?.slice(0, 120) || undefined,
  };
}

function rotatePicks(
  candidates: FeaturedCandidateRow[],
  count: number,
  dayBucket: number,
): ExplorerEditorialPick[] {
  if (candidates.length === 0) {
    return [];
  }

  const sorted = [...candidates].sort(
    (a, b) => b.manualPriority - a.manualPriority || b.qualityScore - a.qualityScore,
  );
  const offset = dayBucket % sorted.length;
  const picks: ExplorerEditorialPick[] = [];

  for (let index = 0; index < Math.min(count, sorted.length); index += 1) {
    picks.push(toPick(sorted[(offset + index) % sorted.length]!));
  }

  return picks;
}

export async function getExplorerEditorialData(): Promise<ExplorerEditorialData> {
  const dayBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const curated = loadCuratedJsonCandidates();

  const constructions = curated.filter((candidate) =>
    ["CONSTRUCTION", "COLLOCATION"].includes(candidate.type),
  );
  const expressions = curated.filter((candidate) =>
    ["EXPRESSION", "NATIVE_PHRASE", "SLANG", "REGIONAL", "CONVERSATION"].includes(
      candidate.type,
    ),
  );

  const [todaysLanguage, grammarSpotlight] = await Promise.all([
    getTodaysDiscovery().catch(() => null),
    getKnowledgeCanvas(),
  ]);

  return {
    todaysLanguage,
    popularConstructions: rotatePicks(constructions, 4, dayBucket),
    nativeExpressions: rotatePicks(expressions, 4, dayBucket + 3),
    grammarSpotlight,
  };
}
