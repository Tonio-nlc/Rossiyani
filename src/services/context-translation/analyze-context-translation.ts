import { z } from "zod";

import { detectInputLanguage } from "@/lib/context-translation/detect-input-language";
import type {
  ContextTranslationAnalysis,
  ContextTranslationSourceLanguage,
  ContextTranslationStreamEvent,
} from "@/lib/context-translation/types";
import { callAnthropicMessages } from "@/services/ai/clients/anthropic-client";
import { callOpenAIChat } from "@/services/ai/clients/openai-client";

import {
  buildContextTranslationCoreSystemPrompt,
  buildContextTranslationCoreUserPrompt,
  buildContextTranslationEnrichmentSystemPrompt,
  buildContextTranslationEnrichmentUserPrompt,
  buildContextTranslationFollowUpSystemPrompt,
  buildContextTranslationFollowUpUserPrompt,
  contextTranslationCoreSchema,
  contextTranslationEnrichmentSchema,
} from "./context-translation-prompt";
import { resolveGrammarConceptForExplorer } from "./resolve-explorer-links";

async function callContextTranslationModel(
  system: string,
  user: string,
): Promise<string | null> {
  const provider = process.env.AI_PROVIDER;
  try {
    if (provider === "openai" && process.env.OPENAI_API_KEY) {
      return await callOpenAIChat({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL ?? "gpt-4o",
        system,
        user,
      });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      return await callAnthropicMessages({
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
        system,
        user,
      });
    }
  } catch {
    return null;
  }
  return null;
}

function parseJsonFromModel(raw: string): unknown {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenceMatch ? fenceMatch[1]!.trim() : trimmed;
  return JSON.parse(jsonText);
}

function dedupeByText<T extends { text: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.text.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function dedupeGrammarConcepts<T extends { label: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.label.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildSaveableLesson(
  sourceText: string,
  core: z.infer<typeof contextTranslationCoreSchema>,
  enrichment: z.infer<typeof contextTranslationEnrichmentSchema>,
  grammarConcepts: ContextTranslationAnalysis["grammarConcepts"],
): ContextTranslationAnalysis["saveableLesson"] {
  return {
    originalSentence: sourceText.trim(),
    bestTranslation: core.bestTranslation.trim(),
    literalMeaning: core.literalMeaning.trim(),
    thinkLikeNative: core.thinkLikeNative,
    naturalness: core.naturalness,
    corrections: enrichment.corrections,
    alternatives: dedupeByText(enrichment.alternatives),
    grammarConcepts,
    culturalNotes: enrichment.culturalNotes,
    vocabulary: enrichment.vocabulary,
  };
}

function assembleAnalysis(
  sourceText: string,
  core: z.infer<typeof contextTranslationCoreSchema>,
  enrichment: z.infer<typeof contextTranslationEnrichmentSchema>,
  grammarConcepts: ContextTranslationAnalysis["grammarConcepts"],
): ContextTranslationAnalysis {
  const alternatives = dedupeByText(enrichment.alternatives);
  const saveableLesson = buildSaveableLesson(sourceText, core, enrichment, grammarConcepts);

  return {
    sourceLanguage: core.sourceLanguage as ContextTranslationSourceLanguage,
    sourceText: sourceText.trim(),
    bestTranslation: core.bestTranslation.trim(),
    literalMeaning: core.literalMeaning.trim(),
    thinkLikeNative: core.thinkLikeNative,
    naturalness: core.naturalness,
    corrections: enrichment.corrections,
    alternatives,
    culturalNotes: enrichment.culturalNotes,
    grammarConcepts: grammarConcepts.filter((concept) => concept.href),
    vocabulary: enrichment.vocabulary,
    saveableLesson,
  };
}

function buildFallbackAnalysis(
  sourceText: string,
  detected: ContextTranslationSourceLanguage,
): ContextTranslationAnalysis {
  const trimmed = sourceText.trim();
  const core = {
    sourceLanguage: detected,
    bestTranslation: trimmed,
    literalMeaning: "Analysis unavailable offline.",
    thinkLikeNative: {
      sourceLanguageLabel: detected === "fr" ? "French" : detected === "en" ? "English" : "Russian",
      sourceThought: trimmed,
      mentalImage: trimmed,
      nativeThought: trimmed,
      nativeFormulation: trimmed,
      conceptualShift:
        "Connect an AI provider to receive Rossiyani's native-speaker explanation of this sentence.",
    },
    naturalness:
      detected === "ru"
        ? {
            score: 50,
            explanation: "Offline — naturalness could not be evaluated.",
            preferredExpression: null,
          }
        : null,
  };

  const enrichment = {
    corrections: [],
    alternatives: [
      {
        register: "neutral" as const,
        text: trimmed,
        frequency: "—",
        nuance: "Offline placeholder",
        whenToUse: "When AI is unavailable",
      },
    ],
    culturalNotes: [],
    grammarConcepts: [],
    vocabulary: [],
  };

  return assembleAnalysis(trimmed, core, enrichment, []);
}

async function analyzeCore(sourceText: string) {
  const detected = detectInputLanguage(sourceText);
  const raw = await callContextTranslationModel(
    buildContextTranslationCoreSystemPrompt(),
    buildContextTranslationCoreUserPrompt(sourceText, detected),
  );

  if (!raw) {
    return null;
  }

  return contextTranslationCoreSchema.parse(parseJsonFromModel(raw));
}

async function analyzeEnrichment(
  sourceText: string,
  core: z.infer<typeof contextTranslationCoreSchema>,
) {
  const raw = await callContextTranslationModel(
    buildContextTranslationEnrichmentSystemPrompt(),
    buildContextTranslationEnrichmentUserPrompt(sourceText, core),
  );

  if (!raw) {
    return null;
  }

  return contextTranslationEnrichmentSchema.parse(parseJsonFromModel(raw));
}

async function enrichGrammarConcepts(
  labels: Array<{ label: string }>,
): Promise<ContextTranslationAnalysis["grammarConcepts"]> {
  const unique = dedupeGrammarConcepts(labels);
  return Promise.all(unique.map((concept) => resolveGrammarConceptForExplorer(concept.label)));
}

export async function analyzeContextTranslation(
  sourceText: string,
): Promise<ContextTranslationAnalysis> {
  const trimmed = sourceText.trim();
  if (!trimmed) {
    throw new Error("Empty input");
  }

  const detected = detectInputLanguage(trimmed);
  const core = await analyzeCore(trimmed);
  if (!core) {
    return buildFallbackAnalysis(trimmed, detected);
  }

  const enrichment = await analyzeEnrichment(trimmed, core);
  if (!enrichment) {
    return buildFallbackAnalysis(trimmed, detected);
  }

  const grammarConcepts = await enrichGrammarConcepts(enrichment.grammarConcepts);
  return assembleAnalysis(trimmed, core, enrichment, grammarConcepts);
}

export async function* streamContextTranslationAnalysis(
  sourceText: string,
): AsyncGenerator<ContextTranslationStreamEvent> {
  const trimmed = sourceText.trim();
  if (!trimmed) {
    yield { type: "error", message: "Empty input" };
    return;
  }

  const detected = detectInputLanguage(trimmed);

  yield { type: "phase", phase: "bestTranslation" };

  const corePromise = analyzeCore(trimmed);
  const enrichmentPromise = corePromise.then((core) =>
    core ? analyzeEnrichment(trimmed, core) : null,
  );

  const core = await corePromise;
  if (!core) {
    const fallback = buildFallbackAnalysis(trimmed, detected);
    yield {
      type: "core",
      data: {
        sourceLanguage: fallback.sourceLanguage,
        bestTranslation: fallback.bestTranslation,
        thinkLikeNative: fallback.thinkLikeNative,
        naturalness: fallback.naturalness,
        literalMeaning: fallback.literalMeaning,
      },
    };
    yield { type: "complete", analysis: fallback };
    return;
  }

  yield {
    type: "core",
    data: {
      sourceLanguage: core.sourceLanguage as ContextTranslationSourceLanguage,
      bestTranslation: core.bestTranslation.trim(),
      thinkLikeNative: core.thinkLikeNative,
      naturalness: core.naturalness,
      literalMeaning: core.literalMeaning.trim(),
    },
  };

  yield { type: "phase", phase: "thinkLikeNative" };
  yield { type: "phase", phase: "grammar" };

  const enrichment = await enrichmentPromise;
  if (!enrichment) {
    const fallback = buildFallbackAnalysis(trimmed, detected);
    yield { type: "complete", analysis: fallback };
    return;
  }

  yield { type: "phase", phase: "alternatives" };

  const grammarConcepts = await enrichGrammarConcepts(enrichment.grammarConcepts);

  yield { type: "phase", phase: "culturalNotes" };

  const analysis = assembleAnalysis(trimmed, core, enrichment, grammarConcepts);
  yield {
    type: "enrichment",
    data: {
      corrections: analysis.corrections,
      alternatives: analysis.alternatives,
      culturalNotes: analysis.culturalNotes,
      grammarConcepts: analysis.grammarConcepts,
      vocabulary: analysis.vocabulary,
    },
  };
  yield { type: "complete", analysis };
}

export async function answerContextTranslationFollowUp(
  analysis: ContextTranslationAnalysis,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  question: string,
): Promise<string> {
  const trimmed = question.trim();
  if (!trimmed) {
    throw new Error("Empty question");
  }

  const raw = await callContextTranslationModel(
    buildContextTranslationFollowUpSystemPrompt(),
    buildContextTranslationFollowUpUserPrompt(
      {
        sourceText: analysis.sourceText,
        bestTranslation: analysis.bestTranslation,
        thinkLikeNative: analysis.thinkLikeNative,
        alternatives: analysis.alternatives,
      },
      history,
      trimmed,
    ),
  );

  if (!raw) {
    return "Follow-up is unavailable offline. Connect an AI provider to continue this lesson.";
  }

  return raw.trim();
}
