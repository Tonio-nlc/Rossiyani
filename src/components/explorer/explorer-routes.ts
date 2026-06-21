import type { PartOfSpeech } from "@/types";

export {
  EXPLORER_CATEGORIES,
  EXPLORER_DISCOVERY_FRAMING,
  EXPLORER_EMPTY_MESSAGE,
  categoryPortalCards,
  getExplorerCategory,
  type ExplorerCategoryMeta,
} from "./explorer-categories";

export function conceptPath(conceptKey: string): string {
  return `/explorer/concepts/${encodeURIComponent(conceptKey)}`;
}

export function lemmaPath(lemma: string, partOfSpeech: PartOfSpeech | string): string {
  return `/explorer/lemmas/${encodeURIComponent(lemma)}?pos=${encodeURIComponent(partOfSpeech)}`;
}

export function endingPath(ending: string, caseKey?: string | null): string {
  const base = `/explorer/endings/${encodeURIComponent(ending)}`;
  return caseKey ? `${base}?case=${encodeURIComponent(caseKey)}` : base;
}

export function casePath(caseKey: string): string {
  return `/explorer/cases/${encodeURIComponent(caseKey)}`;
}

export function expressionPath(label: string): string {
  return `/explorer/expressions/${encodeURIComponent(label)}`;
}

export function collocationPath(label: string): string {
  return `/explorer/collocations/${encodeURIComponent(label)}`;
}

export function textPath(textId: string): string {
  return `/texts/${textId}`;
}

/** Case concepts belong under Cases, not Concepts. */
export function caseKeyFromConceptKey(conceptKey: string): string | null {
  const normalized = conceptKey.trim().toLowerCase();
  if (!normalized.startsWith("case:")) {
    return null;
  }
  const caseKey = normalized.slice("case:".length);
  return caseKey || null;
}
