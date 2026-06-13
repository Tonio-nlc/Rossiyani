import { composeWordDetailFromInput } from "@/features/reader/compose-word-detail-graph";
import type { WordKnowledgeWorkspace, WordKnowledgeWorkspaceInput } from "@/types/knowledge-workspace";
import { WORD_DETAIL_SECTIONS } from "@/types/word-detail-graph";
import type { WordDetailGraph } from "@/types/word-detail-graph";

/**
 * Composes occurrence + canonical knowledge for the Reader Knowledge Workspace.
 * @deprecated Prefer getWordDetailGraphFromDb(wordId) — kept for POST /api/knowledge/workspace.
 */
export async function getWordKnowledgeWorkspace(
  input: WordKnowledgeWorkspaceInput,
): Promise<WordKnowledgeWorkspace> {
  const detail = await composeWordDetailFromInput(input, WORD_DETAIL_SECTIONS);
  return toWordKnowledgeWorkspace(detail);
}

/** Maps unified domain graph to legacy workspace shape for backward compatibility. */
export function toWordKnowledgeWorkspace(detail: WordDetailGraph): WordKnowledgeWorkspace {
  return {
    occurrence: detail.occurrence,
    contextLabel: detail.contextLabel,
    lemmaKnowledge: detail.lemmaKnowledge,
    endingKnowledge: detail.endingKnowledge,
    phraseKnowledge: detail.phraseKnowledge,
    phraseOccurrence: detail.phraseOccurrence,
    concepts: detail.concepts,
    canonicalExplanation: detail.canonicalExplanation,
    grammaticalReason: detail.grammaticalReason,
    frenchComparison: detail.frenchComparison,
    frenchComparisonCanonical: detail.frenchComparisonCanonical,
    relatedTexts: detail.relatedTexts,
    libraryHitCount: detail.statistics.libraryHitCount,
  };
}
