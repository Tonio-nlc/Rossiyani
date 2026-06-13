export type {
  CefrLevel,
  DifficultyScore,
  FrequencyTier,
  PartOfSpeech,
  PhraseGroup,
  PhraseGroupType,
  Register,
  Sentence,
  Text,
  Word,
  WordFrequency,
} from "./domain";

export {
  DIFFICULTY_SCORE_LABELS,
  FREQUENCY_TIER_LABELS,
  PHRASE_GROUP_TYPE_LABELS,
  REGISTER_LABELS,
  WORD_FREQUENCY_LABELS,
} from "./domain";

export type {
  PhraseGroupAnalysisOutput,
  SentenceAnalysisInput,
  SentenceAnalysisOutput,
  WordAnalysisOutput,
  CulturalNoteOutput,
  SyntaxAnalysisOutput,
} from "./analysis";

export type {
  WordDetailGraph,
  WordDetailGraphResponse,
  WordDetailSection,
} from "./word-detail-graph";

export {
  WORD_DETAIL_BASIC_SECTION,
  WORD_DETAIL_ENRICHMENT_SECTIONS,
  WORD_DETAIL_SECTIONS,
} from "./word-detail-graph";

export type {
  IndexAnalysisResult,
  KnowledgeEndingLookupResult,
  KnowledgeEndingRecord,
  KnowledgeFormLookupResult,
  KnowledgeFormRecord,
  KnowledgeLemmaRecord,
  KnowledgePhraseLookupResult,
  KnowledgePhraseRecord,
  KnowledgeSentenceLookupResult,
  WordKnowledgeContext,
} from "./linguistic-library";
