import type { SentenceAnalysisInput } from "../schemas";

const JSON_SHAPE = `{
  "russianText": "string — exact input sentence including punctuation",
  "literalTranslation": "string — French, maximally close to Russian structure",
  "naturalTranslation": "string — French, natural phrasing",
  "russianLogic": "string — French: how a Russian speaker conceptualizes the sentence",
  "orderExplanation": "string — French: word order, emphasis, focus",
  "nativeUsageNotes": "string — French: how common/formal/literary this phrasing is (e.g. extremely common in spoken Russian)",
  "register": "neutral|informal|formal|literary|slang",
  "difficultyScore": 1-5,
  "words": [
    {
      "position": 0,
      "original": "linguistic token only — NO punctuation",
      "lemma": "dictionary form",
      "stressMarked": "token with stress marks",
      "stem": "stem",
      "ending": "ending (empty string if none)",
      "partOfSpeech": "noun|verb|...",
      "isProperNoun": false,
      "lexicalType": "common_noun|proper_noun|verb|adjective|pronoun|numeral|particle|interjection|abbreviation|other",
      "case": "string or null",
      "gender": "string or null",
      "number": "string or null",
      "tense": "string or null",
      "aspect": "string or null",
      "explanation": "string — French pedagogical note",
      "translation": "string — French word-for-word gloss (required, concise)",
      "translationAlternatives": ["optional alternate French glosses"] or null,
      "frequency": "VERY_COMMON|COMMON|UNCOMMON|RARE or null",
      "frequencyTier": "TOP_500|TOP_1000|TOP_3000|BEYOND_TOP_3000 or null"
    }
  ],
  "phraseGroups": [
    {
      "type": "COLLOCATION|FIXED_EXPRESSION|NATIVE_CONSTRUCTION",
      "label": "exact Russian phrase (join of words in the group)",
      "startPosition": 0,
      "endPosition": 1,
      "explanation": "string — French"
    }
  ],
  "needsReview": false,
  "reviewMessage": null
}`;

export function buildSentenceAnalysisSystemPrompt(): string {
  return `You are a Russian linguistics expert teaching French-speaking learners.

Return ONLY valid JSON (no markdown).

Rules:
- All explanations and translations in French.
- Each word MUST include "translation": a concise French gloss for that token (word-for-word meaning in context). Do NOT leave translation empty.
- Set isProperNoun=true and lexicalType=proper_noun for personal names, places, countries, organizations, and brands (e.g. Москва, Анна, Google). Otherwise isProperNoun=false with the matching lexicalType.
- "words" contains ONLY linguistic tokens (nouns, verbs, pronouns, etc.). Do NOT include punctuation (. , ! ? …) as words — punctuation stays in russianText only.
- stem + ending must reconstruct original (stem may be lowercase; capitalization may be on original only, e.g. Таяла = таял + а).
- Stress marks mandatory in stressMarked (not in stem/ending).
- phraseGroups: use label, startPosition, endPosition (inclusive, 0-based word indices). Do NOT use "indices" arrays.
- register: neutral | informal | formal | literary | slang.
- nativeUsageNotes: describe real-world usage frequency and context in French.
- difficultyScore: 1=very easy … 5=advanced/native.
- If uncertain: needsReview=true, reviewMessage="Analyse incertaine. Révision humaine recommandée.", null for unknown morphology.

JSON shape:
${JSON_SHAPE}`;
}

export function buildSentenceAnalysisUserPrompt(input: SentenceAnalysisInput): string {
  return `Analyze this Russian sentence:\n\n${input.russianText}`;
}

export function buildStrictRetrySystemPrompt(attempt: 1 | 2): string {
  const base = buildSentenceAnalysisSystemPrompt();
  if (attempt === 1) {
    return `${base}

RETRY (attempt 1): Your previous response had an empty or invalid "words" array.
You MUST include every linguistic token (nouns, verbs, pronouns, adjectives, etc.) in "words".
Do NOT return words: []. Each token needs position, original, lemma, stem, ending, partOfSpeech, translation, explanation.`;
  }
  return `${base}

FINAL RETRY (attempt 2): Empty words[] is NOT acceptable.
Return complete word-by-word analysis. Minimum: one entry per meaningful token in the sentence.
If uncertain about morphology, set needsReview=true but still include all tokens with translation and explanation.`;
}
