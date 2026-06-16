import { z } from "zod";

export const thinkLikeNativeSchema = z.object({
  sourceLanguageLabel: z.string().min(1),
  sourceThought: z.string().min(1),
  mentalImage: z.string().min(1),
  nativeThought: z.string().min(1),
  nativeFormulation: z.string().min(1),
  conceptualShift: z.string().min(1).max(600),
});

export const naturalnessSchema = z.object({
  score: z.number().min(0).max(100),
  explanation: z.string().min(1),
  preferredExpression: z.string().nullable(),
});

export const contextTranslationCoreSchema = z.object({
  sourceLanguage: z.enum(["fr", "en", "ru", "other"]),
  bestTranslation: z.string().min(1),
  literalMeaning: z.string().min(1),
  thinkLikeNative: thinkLikeNativeSchema,
  naturalness: naturalnessSchema.nullable(),
});

export const contextTranslationEnrichmentSchema = z.object({
  corrections: z
    .array(
      z.object({
        userText: z.string(),
        problem: z.string(),
        nativeInterpretation: z.string(),
        correction: z.string(),
        reason: z.string(),
      }),
    )
    .default([]),
  alternatives: z
    .array(
      z.object({
        register: z.enum(["neutral", "informal", "spoken", "literary", "formal"]),
        text: z.string(),
        frequency: z.string(),
        nuance: z.string(),
        whenToUse: z.string(),
      }),
    )
    .min(1),
  culturalNotes: z.array(z.string()).default([]),
  grammarConcepts: z.array(z.object({ label: z.string() })).default([]),
  vocabulary: z
    .array(
      z.object({
        word: z.string(),
        meaning: z.string(),
      }),
    )
    .default([]),
});

const COACH_RULES = `You are Rossiyani, an editorial linguistic coach for Russian — NOT a translator, NOT ChatGPT, NOT DeepL.

Every response must teach how a native speaker thinks. Never give generic AI filler, motivational text, or random related phrases.

Quality over quantity. If a section would not help the user speak more naturally, omit it or keep it empty.

Output valid JSON only.`;

export function buildContextTranslationCoreSystemPrompt(): string {
  return `${COACH_RULES}

Core analysis rules:
- bestTranslation: the most natural Russian formulation.
- thinkLikeNative: Rossiyani's signature section. Show the source-language thought, the mental image a learner might have, the native Russian mental model (in English/French gloss), then the native formulation. conceptualShift: 2–4 short sentences explaining the conceptual shift — never generic.
- literalMeaning: what the best Russian literally says (for saving lessons).
- naturalness: ONLY when input is Russian. Score 0–100 with a specific explanation of WHY. Include preferredExpression when score < 85. Set null for French/English input.`;
}

export function buildContextTranslationCoreUserPrompt(
  sourceText: string,
  detectedLanguage: string,
): string {
  return `Analyze this input and return JSON for the core lesson.

Detected source language hint: ${detectedLanguage}
User input:
"""
${sourceText}
"""

JSON schema:
{
  "sourceLanguage": "fr" | "en" | "ru" | "other",
  "bestTranslation": "Most natural Russian",
  "literalMeaning": "What the Russian literally says",
  "thinkLikeNative": {
    "sourceLanguageLabel": "French | English | Russian",
    "sourceThought": "Quoted original sentence",
    "mentalImage": "How a learner might literally picture it",
    "nativeThought": "How a native Russian speaker thinks it (English gloss)",
    "nativeFormulation": "Native Russian (usually matches bestTranslation)",
    "conceptualShift": "2-4 sentences on why natives phrase it this way"
  },
  "naturalness": null | { "score": 0-100, "explanation": "...", "preferredExpression": "..." | null }
}`;
}

export function buildContextTranslationEnrichmentSystemPrompt(): string {
  return `${COACH_RULES}

Enrichment rules:
- If input is Russian with mistakes, fill corrections[] with specific error analysis (cases, aspect, register, false friends, etc.).
- If input is French or English, corrections[] must be empty.
- alternatives: distinct by register; never duplicate wording; include frequency, nuance, when natives actually use it.
- culturalNotes: practical observations only — no invented history. Max 4. Omit generic notes.
- grammarConcepts: real linguistic labels only (cases, aspect, constructions, idioms) — max 5 verified concepts.
- vocabulary: key words from the best translation — max 6 items.`;
}

export function buildContextTranslationEnrichmentUserPrompt(
  sourceText: string,
  core: z.infer<typeof contextTranslationCoreSchema>,
): string {
  return `Given this core analysis, return enrichment JSON.

Original input:
"""
${sourceText}
"""

Best translation: ${core.bestTranslation}
Native formulation: ${core.thinkLikeNative.nativeFormulation}

JSON schema:
{
  "corrections": [{ "userText", "problem", "nativeInterpretation", "correction", "reason" }],
  "alternatives": [{ "register": "neutral|informal|spoken|literary|formal", "text", "frequency", "nuance", "whenToUse" }],
  "culturalNotes": ["..."],
  "grammarConcepts": [{ "label": "Dative case" }],
  "vocabulary": [{ "word": "...", "meaning": "..." }]
}`;
}

export function buildContextTranslationFollowUpSystemPrompt(): string {
  return `${COACH_RULES}

The user is asking a follow-up about a context translation lesson already analyzed.
Answer using the previous analysis as context. Do not restart from zero.
Keep answers concise (2–5 sentences), editorial in tone — no chatbot filler.
If the question is about register, context, or usage, reference the specific Russian phrases from the lesson.`;
}

export function buildContextTranslationFollowUpUserPrompt(
  analysis: {
    sourceText: string;
    bestTranslation: string;
    thinkLikeNative: z.infer<typeof thinkLikeNativeSchema>;
    alternatives: Array<{ register: string; text: string }>;
  },
  history: Array<{ role: string; content: string }>,
  question: string,
): string {
  const altSummary = analysis.alternatives
    .map((item) => `${item.register}: ${item.text}`)
    .join("\n");

  const historyBlock =
    history.length > 0
      ? history.map((message) => `${message.role}: ${message.content}`).join("\n")
      : "(none)";

  return `Lesson context:
Source: ${analysis.sourceText}
Best translation: ${analysis.bestTranslation}
Native thought: ${analysis.thinkLikeNative.nativeThought}
Conceptual shift: ${analysis.thinkLikeNative.conceptualShift}
Alternatives:
${altSummary}

Conversation so far:
${historyBlock}

Follow-up question:
${question}

Reply in plain text (no JSON).`;
}
