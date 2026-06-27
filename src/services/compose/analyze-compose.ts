import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  collocationPath,
  conceptPath,
  expressionPath,
  lemmaPath,
  textPath,
} from "@/components/explorer/explorer-routes";
import type {
  ComposeAnalysis,
  ComposeAnalyzeRequest,
  ComposeRegister,
  ComposeTheme,
} from "@/lib/compose/types";
import { PRACTICE_REWRITE_PRESETS } from "@/lib/compose/types";
import { callAnthropicMessages } from "@/services/ai/clients/anthropic-client";
import { callOpenAIChat } from "@/services/ai/clients/openai-client";

import {
  buildComposeRewritePrompt,
  buildComposeRewriteSystemPrompt,
  buildComposeSystemPrompt,
  buildComposeUserPrompt,
  composeAnalysisSchema,
} from "./compose-prompt";
import {
  enrichVocabularyLinks,
  type KnownReaderWord,
} from "./enrich-vocabulary-links";

export type { KnownReaderWord };

async function callComposeModel(system: string, user: string): Promise<string | null> {
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

async function resolveExplorerHref(query: string): Promise<string | undefined> {
  const q = query.trim();
  if (!q) {
    return undefined;
  }

  const [lemma, phrase, concept] = await Promise.all([
    prisma.knowledgeLemma.findFirst({
      where: { lemma: q },
      select: { lemma: true, partOfSpeech: true },
    }),
    prisma.knowledgePhrase.findFirst({
      where: { label: { contains: q } },
      select: { label: true, type: true },
    }),
    prisma.knowledgeConcept.findFirst({
      where: {
        OR: [{ title: { contains: q } }, { conceptKey: { contains: q } }],
      },
      select: { conceptKey: true },
    }),
  ]);

  if (lemma) {
    return lemmaPath(lemma.lemma, lemma.partOfSpeech);
  }
  if (phrase) {
    return phrase.type === "COLLOCATION"
      ? collocationPath(phrase.label)
      : expressionPath(phrase.label);
  }
  if (concept) {
    return conceptPath(concept.conceptKey);
  }

  return `/explorer?q=${encodeURIComponent(q)}`;
}

async function enrichRelatedExpressions(
  items: Array<string | { label: string; reason: string }>,
): Promise<ComposeAnalysis["relatedExpressions"]> {
  const results: ComposeAnalysis["relatedExpressions"] = [];

  for (const item of items.slice(0, 4)) {
    const label = typeof item === "string" ? item : item.label;
    const reason =
      typeof item === "string" ? "Related pattern worth exploring in context." : item.reason;
    const href = (await resolveExplorerHref(label)) ?? `/explorer?q=${encodeURIComponent(label)}`;
    results.push({ label, href, reason });
  }

  return results;
}

function fallbackReasonForPhrase(label: string, sourceText: string): string {
  const sourceTokens = new Set(
    sourceText
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.replace(/[.,!?«»"']/g, "")),
  );
  const labelTokens = label
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[.,!?«»"']/g, ""));

  const shared = labelTokens.filter((token) => sourceTokens.has(token));
  if (shared.length >= 2) {
    return "Same construction with a different wording.";
  }
  if (label.includes("…") || label.endsWith("...")) {
    return "A parallel pattern you can adapt to your own idea.";
  }
  return "A nearby expression that expands how natives phrase this idea.";
}

async function findRelatedExpressionsFallback(russianText: string): Promise<ComposeAnalysis["relatedExpressions"]> {
  const tokens = russianText
    .split(/\s+/)
    .map((word) => word.replace(/[.,!?«»"']/g, ""))
    .filter((word) => word.length > 3);

  if (tokens.length === 0) {
    return [];
  }

  const phrases = await prisma.knowledgePhrase.findMany({
    where: {
      OR: tokens.slice(0, 4).map((token) => ({ label: { contains: token } })),
    },
    take: 12,
    select: { label: true, type: true },
  });

  const seen = new Set<string>();
  const labels: string[] = [];
  for (const phrase of phrases) {
    const key = phrase.label.toLowerCase();
    if (seen.has(key) || key === russianText.trim().toLowerCase()) {
      continue;
    }
    seen.add(key);
    labels.push(phrase.label);
  }

  return enrichRelatedExpressions(
    labels.slice(0, 4).map((label) => ({
      label,
      reason: fallbackReasonForPhrase(label, russianText),
    })),
  );
}

async function enrichStructures(structureLabels: string[]): Promise<ComposeAnalysis["structures"]> {
  const results: ComposeAnalysis["structures"] = [];

  for (const label of structureLabels.slice(0, 12)) {
    const href = (await resolveExplorerHref(label)) ?? `/explorer?q=${encodeURIComponent(label)}`;
    results.push({ label, href });
  }

  return results;
}

async function enrichLinguisticBlocks(
  blocks: Array<{ category: string; note: string; explorerQuery?: string }>,
): Promise<ComposeAnalysis["linguisticBlocks"]> {
  return Promise.all(
    blocks.slice(0, 8).map(async (block, index) => ({
      id: `block-${index}`,
      category: block.category,
      note: block.note,
      explorerHref: block.explorerQuery
        ? await resolveExplorerHref(block.explorerQuery)
        : undefined,
    })),
  );
}

function truncateExcerpt(sentence: string, max = 140): string {
  const trimmed = sentence.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max).trim()}…`;
}

async function findAuthenticExamples(russianText: string): Promise<ComposeAnalysis["authenticExamples"]> {
  const token = russianText.split(/\s+/).find((word) => word.length > 3)?.replace(/[.,!?«»"']/g, "");

  if (token) {
    const occurrences = await prisma.knowledgeOccurrence.findMany({
      where: {
        OR: [
          { sentenceRussian: { contains: token } },
          { explanationSnapshot: { contains: token } },
        ],
        textId: { not: null },
        sentenceRussian: { not: "" },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { textId: true, textTitle: true, sentenceRussian: true },
    });

    const seen = new Set<string>();
    const results: ComposeAnalysis["authenticExamples"] = [];

    for (const occurrence of occurrences) {
      if (!occurrence.textId || !occurrence.textTitle || !occurrence.sentenceRussian) {
        continue;
      }
      if (seen.has(occurrence.textId)) {
        continue;
      }
      seen.add(occurrence.textId);
      results.push({
        textTitle: occurrence.textTitle,
        href: textPath(occurrence.textId),
        excerpt: truncateExcerpt(occurrence.sentenceRussian),
      });
      if (results.length >= 3) {
        break;
      }
    }

    if (results.length > 0) {
      return results;
    }
  }

  const texts = await prisma.text.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      sentences: {
        take: 1,
        orderBy: { position: "asc" },
        select: { russianText: true },
      },
    },
  });

  return texts.map((text, index) => ({
    textTitle: `${text.title}${texts.length > 1 ? ` #${index + 1}` : ""}`,
    href: textPath(text.id),
    excerpt: truncateExcerpt(text.sentences[0]?.russianText ?? text.title),
  }));
}

async function fallbackAnalysis(input: ComposeAnalyzeRequest): Promise<ComposeAnalysis> {
  const words = input.russianText.trim().split(/\s+/).filter(Boolean);
  const [structures, examples, relatedExpressions, vocabularyLinks] = await Promise.all([
    enrichStructures(words.slice(0, 5)),
    findAuthenticExamples(input.russianText),
    findRelatedExpressionsFallback(input.russianText),
    enrichVocabularyLinks({
      russianText: input.russianText,
      knownWords: input.knownWords,
    }),
  ]);

  return {
    mode: input.mode,
    verdict: words.length > 2 ? "unusual" : "needs_correction",
    summary: "Analyse hors ligne — explorez les structures liées dans Vocabulary.",
    correctedSentence: input.russianText.trim(),
    overview: {
      strengths: ["Vous avez produit une phrase en russe."],
      improvements: ["Relancez l'analyse lorsque la connexion est disponible."],
    },
    corrections: [],
    vocabularyLinks,
    linguisticBlocks: [
      {
        id: "fallback-0",
        category: "Registre",
        note: input.register ? `Registre visé : ${input.register}.` : "Registre neutre supposé.",
      },
    ],
    alternatives: [],
    structures,
    authenticExamples: examples,
    relatedExpressions,
    rewritePrompts: PRACTICE_REWRITE_PRESETS.map((preset) => preset.instruction),
  };
}

function normalizeSentence(value: string): string {
  return value.trim().toLowerCase().replace(/[.,!?«»"'\s]+/g, "");
}

function isNearlyIdentical(original: string, rewritten: string): boolean {
  const source = normalizeSentence(original);
  const target = normalizeSentence(rewritten);
  if (!source || !target) {
    return true;
  }
  if (source === target) {
    return true;
  }
  const shorter = source.length <= target.length ? source : target;
  const longer = source.length <= target.length ? target : source;
  return longer.includes(shorter) && Math.abs(source.length - target.length) <= 4;
}

const rewriteResultSchema = z.object({
  text: z.string().min(1),
  explanation: z.string().min(1),
});

function parseRewriteResult(raw: string): { text: string; explanation: string } | null {
  try {
    return rewriteResultSchema.parse(parseJsonFromModel(raw));
  } catch {
    const text = raw.trim().replace(/^["«]|["»]$/g, "");
    if (!text) {
      return null;
    }
    return {
      text,
      explanation: "The wording or register was adjusted to sound more natural.",
    };
  }
}

function fallbackRewrite(original: string, instruction: string): { text: string; explanation: string } {
  if (instruction.toLowerCase().includes("conversational")) {
    const text = original.includes("очень") ? `${original.replace(/\.$/, "")}, знаешь?` : `${original.replace(/\.$/, "")}, знаешь?`;
    return {
      text,
      explanation: "Conversational Russian often adds a softener or particle to sound less formal.",
    };
  }
  if (instruction.toLowerCase().includes("literary")) {
    return {
      text: original.replace(/^я /i, "Мне ").replace(/\.$/, ""),
      explanation: "Literary phrasing often shifts perspective or removes casual markers.",
    };
  }
  const text = original.includes("очень") ? original : original.replace(/\b(нравится|люблю)\b/i, "$1 очень");
  return {
    text,
    explanation: "Native speakers often reinforce the predicate for a more natural rhythm.",
  };
}

export async function analyzeComposeText(input: ComposeAnalyzeRequest): Promise<ComposeAnalysis> {
  const mode = input.mode ?? "free";
  const raw = await callComposeModel(
    buildComposeSystemPrompt(mode),
    buildComposeUserPrompt({ ...input, mode }),
  );

  if (!raw) {
    return fallbackAnalysis(input);
  }

  try {
    const parsed = composeAnalysisSchema.parse(parseJsonFromModel(raw));
    const [
      linguisticBlocks,
      structures,
      authenticExamples,
      relatedExpressions,
      vocabularyLinks,
    ] = await Promise.all([
      enrichLinguisticBlocks(parsed.linguisticBlocks),
      enrichStructures(parsed.structures),
      findAuthenticExamples(input.russianText),
      parsed.relatedExpressions?.length
        ? enrichRelatedExpressions(parsed.relatedExpressions)
        : findRelatedExpressionsFallback(input.russianText),
      enrichVocabularyLinks({
        russianText: input.russianText,
        knownWords: input.knownWords,
      }),
    ]);

    return {
      mode,
      verdict: parsed.verdict,
      summary: parsed.summary,
      correctedSentence: parsed.correctedSentence ?? null,
      overview: parsed.overview,
      corrections: (parsed.corrections ?? []).map((entry, index) => ({
        id: `correction-${index}`,
        ...entry,
      })),
      vocabularyLinks,
      linguisticBlocks,
      alternatives: parsed.alternatives.slice(0, 4).map((alt) => ({
        register: alt.register,
        text: alt.text,
        nuance: alt.nuance,
      })),
      structures,
      authenticExamples,
      relatedExpressions,
      rewritePrompts: PRACTICE_REWRITE_PRESETS.map((preset) => preset.instruction),
    };
  } catch {
    return fallbackAnalysis(input);
  }
}

export async function rewriteComposeText(input: {
  russianText: string;
  instruction: string;
  context?: string;
}): Promise<{ text: string; explanation: string }> {
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const raw = await callComposeModel(
      buildComposeRewriteSystemPrompt(),
      buildComposeRewritePrompt({ ...input, attempt }),
    );

    if (!raw) {
      break;
    }

    const parsed = parseRewriteResult(raw);
    if (parsed && !isNearlyIdentical(input.russianText, parsed.text)) {
      return parsed;
    }
  }

  const fallback = fallbackRewrite(input.russianText, input.instruction);
  if (!isNearlyIdentical(input.russianText, fallback.text)) {
    return fallback;
  }

  return {
    text: `${input.russianText.replace(/\.$/, "")} — иначе`,
    explanation: "The sentence keeps your idea but opens a different phrasing path to explore.",
  };
}

export type { ComposeTheme, ComposeRegister };
