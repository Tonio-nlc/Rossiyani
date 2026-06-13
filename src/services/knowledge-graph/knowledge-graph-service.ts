import type { PartOfSpeech } from "@prisma/client";

import type {
  CaseGraph,
  ConceptGraph,
  EndingGraph,
  LemmaGraph,
  MergeOccurrenceInput,
  MergeOccurrenceResult,
  PhraseGraph,
} from "@/types/knowledge-graph";

import { getCaseGraph } from "./get-case-graph";
import { getConceptGraph } from "./get-concept-graph";
import { getEndingGraph } from "./get-ending-graph";
import { getLemmaGraph } from "./get-lemma-graph";
import { getPhraseGraph } from "./get-phrase-graph";
import { mergeOccurrence } from "./merge-occurrence";

/**
 * Facade for the KnowledgeGraph — canonical pedagogical layer over LinguisticLibrary.
 */
export class KnowledgeGraphService {
  getLemmaGraph(lemma: string, partOfSpeech: PartOfSpeech): Promise<LemmaGraph | null> {
    return getLemmaGraph(lemma, partOfSpeech);
  }

  getEndingGraph(ending: string, grammaticalCase?: string | null): Promise<EndingGraph | null> {
    return getEndingGraph(ending, grammaticalCase);
  }

  getCaseGraph(caseKey: string): Promise<CaseGraph | null> {
    return getCaseGraph(caseKey);
  }

  getPhraseGraph(label: string): Promise<PhraseGraph | null> {
    return getPhraseGraph(label);
  }

  getConceptGraph(conceptKeyOrTitle: string): Promise<ConceptGraph | null> {
    return getConceptGraph(conceptKeyOrTitle);
  }

  mergeOccurrence(input: MergeOccurrenceInput): Promise<MergeOccurrenceResult> {
    return mergeOccurrence(input);
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();
