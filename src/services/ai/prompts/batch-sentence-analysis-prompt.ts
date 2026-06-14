import type { SentenceAnalysisInput } from "../schemas";

import {
  buildSentenceAnalysisSystemPrompt,
} from "./sentence-analysis-prompt";

const SINGLE_SENTENCE_SHAPE = `{
  "russianText": "string",
  "literalTranslation": "string",
  "naturalTranslation": "string",
  "russianLogic": "string",
  "orderExplanation": "string",
  "nativeUsageNotes": "string",
  "register": "neutral|informal|formal|literary|slang",
  "difficultyScore": 1-5,
  "words": [ { "position": 0, "original": "...", "lemma": "...", "stressMarked": "...", "stem": "...", "ending": "...", "partOfSpeech": "...", "case": null, "gender": null, "number": null, "tense": null, "aspect": null, "explanation": "...", "translation": "...", "translationAlternatives": null, "frequency": null, "frequencyTier": null } ],
  "phraseGroups": [ { "type": "COLLOCATION|FIXED_EXPRESSION|NATIVE_CONSTRUCTION", "label": "...", "startPosition": 0, "endPosition": 1, "explanation": "..." } ],
  "needsReview": false,
  "reviewMessage": null
}`;

export function buildBatchSentenceAnalysisSystemPrompt(): string {
  const base = buildSentenceAnalysisSystemPrompt();
  return `${base}

BATCH MODE: Analyze EVERY sentence in the numbered input list.
Return JSON: { "sentences": [ ${SINGLE_SENTENCE_SHAPE}, ... ] }
The "sentences" array MUST have exactly one entry per input sentence, in the SAME ORDER.`;
}

export function buildBatchSentenceAnalysisUserPrompt(inputs: SentenceAnalysisInput[]): string {
  const lines = inputs.map((input, index) => `${index + 1}. ${input.russianText}`);
  return `Analyze these ${inputs.length} Russian sentences:\n\n${lines.join("\n\n")}`;
}

export function buildBatchStrictRetrySystemPrompt(): string {
  return `${buildBatchSentenceAnalysisSystemPrompt()}

RETRY: Previous batch response was incomplete. Return a "sentences" array with one complete analysis per input sentence. Every sentence MUST include a non-empty "words" array.`;
}
