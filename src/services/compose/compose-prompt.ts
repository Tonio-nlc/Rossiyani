import { z } from "zod";

import type { ComposeMode, ComposeRegister, ComposeTheme } from "@/lib/compose/types";

export const composeAnalysisSchema = z.object({
  verdict: z.enum(["natural", "correct", "unusual", "needs_correction"]),
  summary: z.string().min(1),
  correctedSentence: z.string().optional().nullable(),
  overview: z
    .object({
      strengths: z.array(z.string().min(1)).min(1).max(4),
      improvements: z.array(z.string().min(1)).min(1).max(4),
    })
    .optional(),
  corrections: z
    .array(
      z.object({
        fragment: z.string().min(1),
        corrected: z.string().min(1),
        explanation: z.string().min(1),
        rule: z.string().min(1),
        contextNote: z.string().min(1),
      }),
    )
    .optional(),
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
      nuance: z.string().optional(),
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

const MODE_INSTRUCTIONS: Record<ComposeMode, string> = {
  translation:
    "The learner translated a French prompt into Russian. Judge accuracy to the intended meaning, then teach natural phrasing.",
  reformulation:
    "The learner rewrote a reference Russian sentence with a different natural formulation. Compare both versions and explain stylistic or structural differences.",
  free:
    "The learner wrote freely in Russian. Analyze grammar, vocabulary, cases, conjugations, word order, and unnatural phrasing.",
  post_reading:
    "This exercise follows a completed reading. Reinforce vocabulary and structures from that context while correcting the production.",
};

export function buildComposeSystemPrompt(mode: ComposeMode = "free"): string {
  return `You are a Russian writing tutor for Rossiyani Compose — an editorial writing studio, NOT a chatbot or translation engine.

Mode: ${mode}
${MODE_INSTRUCTIONS[mode]}

Respond with ONLY valid JSON matching this schema:
{
  "verdict": "natural" | "correct" | "unusual" | "needs_correction",
  "summary": "one concise pedagogical sentence in French",
  "correctedSentence": "full corrected Russian sentence or null if already perfect",
  "overview": {
    "strengths": ["2-3 short strengths in French"],
    "improvements": ["2-3 main improvement axes in French"]
  },
  "corrections": [{
    "fragment": "problematic fragment from learner text",
    "corrected": "corrected fragment",
    "explanation": "why in simple French",
    "rule": "grammar/vocab rule name",
    "contextNote": "when this rule applies"
  }],
  "linguisticBlocks": [{ "category": "Cas|Aspect|Ordre des mots|Registre|...", "note": "...", "explorerQuery": "optional" }],
  "alternatives": [{ "register": "Neutre|Familier|Formel|...", "text": "Russian sentence", "nuance": "short French nuance" }],
  "structures": ["short Russian grammar/vocab patterns"],
  "relatedExpressions": [{ "label": "Russian phrase", "reason": "why explore next" }],
  "authenticExampleHints": ["optional keywords"]
}

Rules:
- Write pedagogical notes in French. Russian only in examples and corrected text.
- Never conversational tone. Never ask questions. Never markdown.
- Each correction must teach something: why, which rule, which context.
- Provide 2-4 natural alternatives with nuance when possible.
- correctedSentence must reflect the learner's intended meaning.
- verdict "natural" only if truly idiomatic for the requested register.`;
}

export function buildComposeUserPrompt(input: {
  mode?: ComposeMode;
  context?: string;
  russianText: string;
  frenchPrompt?: string;
  referenceRussian?: string;
  theme?: ComposeTheme;
  register?: ComposeRegister;
}): string {
  const mode = input.mode ?? "free";
  const lines: string[] = [];

  if (mode === "translation" && input.frenchPrompt?.trim()) {
    lines.push(`French prompt to translate:\n${input.frenchPrompt.trim()}`);
  }

  if (mode === "reformulation" && input.referenceRussian?.trim()) {
    lines.push(`Reference Russian sentence:\n${input.referenceRussian.trim()}`);
  }

  if (mode === "post_reading" && input.context?.trim()) {
    lines.push(`Reading context:\n${input.context.trim()}`);
  }

  lines.push(`\nLearner's Russian production:\n${input.russianText.trim()}`);

  if (input.context?.trim() && mode !== "post_reading") {
    lines.push(`\nIntended meaning / notes:\n${input.context.trim()}`);
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
