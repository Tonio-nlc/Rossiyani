export { buildEntityPageFromConceptCurated, buildEntityPageFromConceptKnowledge, buildEntityPageFromCuratedPhrase, buildEntityPageFromLemmaCurated, buildEntityPageFromPhraseKnowledge } from "./build-entity-page";
export { findCuratedCandidateExact, findCuratedCandidateFuzzy, getPopularCuratedConstructions, searchCuratedCandidates } from "./curated-lookup";
export { findConceptRowFuzzy, findLemmaRowFuzzy, findPhraseRowFuzzy } from "./fuzzy-match";
export { curatedCandidateHref, phraseRouteForType } from "./paths";
export { redirectIfCanonicalMismatch } from "./redirect";
export { resolveConceptEntity } from "./resolve-concept";
export type { ConceptEntityResolution } from "./resolve-concept";
export { resolveLemmaEntity } from "./resolve-lemma";
export type { LemmaEntityResolution } from "./resolve-lemma";
export { labelsEquivalent, resolvePhraseEntity, phraseTypeLabel } from "./resolve-phrase";
export type { PhraseEntityResolution } from "./resolve-phrase";
export type { ExplorerEntityExample, ExplorerEntityKind, ExplorerEntityPageData, ExplorerEntityPick, PhraseRouteHint } from "./types";
export {
  buildMetadataLine,
  buildWhyItMatters,
  frequencyLabelFromCount,
  frequencyLabelFromScore,
  registerBadge,
  splitEditorialParagraphs,
} from "./types";
