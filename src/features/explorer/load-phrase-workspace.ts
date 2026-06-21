import {
  buildPhrasePresentationFromCurated,
  buildPhrasePresentationFromKnowledge,
  type ExplorerPhrasePresentation,
} from "@/components/explorer/explorer-phrase-presentation";
import { getSimilarPhrases } from "@/features/explorer/get-similar-phrases";
import { knowledgeGraphService } from "@/services/knowledge-graph";

import {
  labelsEquivalent,
  resolvePhraseEntity,
} from "./entity/resolve-phrase";
import type { PhraseEntityResolution } from "./entity/resolve-phrase";

export type PhraseWorkspaceData = {
  presentation: ExplorerPhrasePresentation;
};

export type PhraseWorkspaceLoadResult =
  | { status: "not_found" }
  | { status: "redirect"; path: string }
  | { status: "ok"; data: PhraseWorkspaceData };

async function buildPresentation(
  resolved: PhraseEntityResolution,
): Promise<ExplorerPhrasePresentation> {
  if (resolved.knowledge) {
    const graph = await knowledgeGraphService.getPhraseGraph(resolved.knowledge.label);
    const similarPhrases = await getSimilarPhrases(
      resolved.knowledge.label,
      resolved.knowledge.type,
    );
    return buildPhrasePresentationFromKnowledge(
      resolved.knowledge,
      resolved.routeHint,
      graph,
      similarPhrases,
    );
  }

  if (resolved.curated) {
    const similarPhrases = await getSimilarPhrases(
      resolved.curated.lemma,
      resolved.routeHint === "collocation" ? "COLLOCATION" : "FIXED_EXPRESSION",
    );
    return buildPhrasePresentationFromCurated(
      resolved.curated,
      resolved.routeHint,
      similarPhrases,
    );
  }

  throw new Error("Phrase resolution missing knowledge and curated data");
}

export async function loadPhraseWorkspace(
  label: string,
  routeKind: "collocation" | "expression",
): Promise<PhraseWorkspaceLoadResult> {
  const resolved = await resolvePhraseEntity(label, { routeKind });

  if (!resolved) {
    return { status: "not_found" };
  }

  if (!labelsEquivalent(resolved.requestedLabel, resolved.canonicalLabel)) {
    return { status: "redirect", path: resolved.canonicalPath };
  }

  return {
    status: "ok",
    data: {
      presentation: await buildPresentation(resolved),
    },
  };
}
