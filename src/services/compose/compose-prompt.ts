import { z } from "zod";

import type { ComposeRegister, ComposeTheme } from "@/lib/compose/types";

export const composeAnalysisSchema = z.object({
  verdict: z.enum(["natural", "correct", "unusual", "needs_correction"]),
  summary: z.string().min(1),
  linguisticBlocks: z.array(
    z.object({
      category: z.string().min(1),
      note: z.string().min(1),
      explorerQuery: z.string().optional(),
    }),
  ),
  alternatives: z.array(
    z.object({
      register: z.string().min(1),
      text: z.string().min(1),
    }),
  ),
  structures: z.array(z.string().min(1)),
  relatedExpressions: z
    .array(
      z.object({
        label: z.string().min(1),
        reason: z.string().min(1),
      }),
    )
    .optional(),
  authenticExampleHints: z.array(z.string()).optional(),
});

export type ComposeAnalysisPayload = z.infer<typeof composeAnalysisSchema>;

export function buildComposeSystemPrompt(): string {
  return `You are a Russian linguistic analyst for Rossiyani — an editorial writing studio, NOT a chatbot.

Respond with ONLY valid JSON matching this schema:
{
  "verdict": "natural" | "correct" | "unusual" | "needs_correction",
  "summary": "one concise sentence",
  "linguisticBlocks": [{ "category": "Case|Verb aspect|Word order|Register|Collocations|...", "note": "...", "explorerQuery": "optional search term" }],
  "alternatives": [{ "register": "Neutral|Conversational|Formal|...", "text": "Russian sentence" }],
  "structures": ["short Russian grammar/vocab patterns found"],
  "relatedExpressions": [{ "label": "Russian phrase", "reason": "one short sentence explaining why it is relevant" }],
  "authenticExampleHints": ["optional topic keywords for finding texts"]
}

Rules:
- Never conversational tone. Never ask questions. Never markdown.
- Focus on why a native would phrase it differently.
- Provide 2-4 alternatives when possible.
- Extract concrete structures (phrases, patterns) from the sentence.
- Suggest 3-4 related expressions with a clear reason each (why explore this next).
- verdict "natural" only if truly idiomatic for the requested register.`;
}

export function buildComposeUserPrompt(input: {
  context?: string;
  russianText: string;
  theme?: ComposeTheme;
  register?: ComposeRegister;
}): string {
  const lines = [
    `Russian production to analyze:\n${input.russianText.trim()}`,
  ];

  if (input.context?.trim()) {
    lines.push(`\nIntended meaning (context, may be in any language):\n${input.context.trim()}`);
  }

  if (input.theme) {
    lines.push(`\nTheme: ${input.theme.replace("_", " ")}`);
  }

  if (input.register) {
    lines.push(`Target register: ${input.register}`);
  }

  return lines.join("\n");
}

export function buildComposeRewriteSystemPrompt(): string {
  return `You rewrite Russian sentences for Rossiyani Practice. Respond with ONLY valid JSON:
{
  "text": "rewritten Russian sentence",
  "explanation": "one or two concise sentences explaining what changed and why"
}

Rules:
- The rewrite MUST differ meaningfully from the original (wording, register, syntax, construction, or collocation).
- Never return the original sentence unchanged or nearly unchanged.
- Never ask questions. Never markdown.`;
}

export function buildComposeRewritePrompt(input: {
  russianText: string;
  instruction: string;
  context?: string;
  attempt?: number;
}): string {
  const retryNote =
    input.attempt && input.attempt > 0
      ? `\nPrevious attempt was too similar to the original. Make a bolder, clearly different rewrite.\n`
      : "";

  return `${retryNote}Rewrite this Russian sentence following the instruction.

Instruction: ${input.instruction}

${input.context ? `Context: ${input.context}\n` : ""}
Original: ${input.russianText}`;
}
