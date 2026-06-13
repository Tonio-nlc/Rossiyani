import { AsyncLocalStorage } from "node:async_hooks";

const LOG_PREFIX = "[IMPORT-PIPELINE]";

export type PipelineStepStatus = "success" | "failure" | "skipped";

export type PipelineStepRecord = {
  step: string;
  status: PipelineStepStatus;
  location: string;
  sentenceIndex?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    cause?: string;
  };
  durationMs?: number;
};

type ImportPipelineAuditStore = {
  steps: PipelineStepRecord[];
  meta: {
    title?: string;
    rawTextLength?: number;
    sentenceCount?: number;
    storedSentenceCount?: number;
    currentSentenceIndex?: number;
  };
};

const auditStorage = new AsyncLocalStorage<ImportPipelineAuditStore>();

function getStore(): ImportPipelineAuditStore | undefined {
  return auditStorage.getStore();
}

function serializeError(error: unknown): PipelineStepRecord["error"] {
  if (error instanceof Error) {
    const cause = (error as Error & { cause?: unknown }).cause;
    return {
      message: error.message,
      stack: error.stack,
      cause: cause instanceof Error ? cause.message : cause ? String(cause) : undefined,
    };
  }
  return { message: String(error) };
}

function previewText(value: string, max = 120): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max)}…`;
}

function logBlock(title: string, lines: string[]): void {
  console.error(LOG_PREFIX);
  console.error(LOG_PREFIX, title);
  console.error(LOG_PREFIX, "------------------");
  for (const line of lines) {
    console.error(LOG_PREFIX, line);
  }
  console.error(LOG_PREFIX, "------------------");
}

export function runImportPipelineAudit<T>(fn: () => Promise<T>): Promise<T> {
  return auditStorage.run({ steps: [], meta: {} }, fn);
}

export function setImportPipelineMeta(meta: Partial<ImportPipelineAuditStore["meta"]>): void {
  const store = getStore();
  if (!store) {
    return;
  }
  store.meta = { ...store.meta, ...meta };
}

export function recordPipelineStep(record: PipelineStepRecord): void {
  getStore()?.steps.push(record);
}

export async function auditPipelineStep<T>(
  step: string,
  location: string,
  input: Record<string, unknown>,
  fn: () => Promise<T>,
  mapOutput?: (result: T) => Record<string, unknown>,
): Promise<T> {
  const startedAt = Date.now();
  logBlock(`[${step.toUpperCase()}]`, [
    "input:",
    ...Object.entries(input).map(([key, value]) => `  ${key}: ${formatValue(value)}`),
  ]);

  try {
    const result = await fn();
    const output = mapOutput ? mapOutput(result) : summarizeValue(result);
    const durationMs = Date.now() - startedAt;
    const entry: PipelineStepRecord = {
      step,
      status: "success",
      location,
      input,
      output,
      durationMs,
      sentenceIndex: typeof input.sentenceIndex === "number" ? input.sentenceIndex : undefined,
    };
    recordPipelineStep(entry);
    logBlock(`[${step.toUpperCase()}] ✓`, [
      ...Object.entries(output).map(([key, value]) => `${key}: ${formatValue(value)}`),
      `durationMs: ${durationMs}`,
    ]);
    return result;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const serialized = serializeError(error)!;
    const entry: PipelineStepRecord = {
      step,
      status: "failure",
      location,
      input,
      error: serialized,
      durationMs,
      sentenceIndex: typeof input.sentenceIndex === "number" ? input.sentenceIndex : undefined,
    };
    recordPipelineStep(entry);
    logBlock(`[${step.toUpperCase()}] ✗`, [
      `message: ${serialized.message}`,
      serialized.cause ? `cause: ${serialized.cause}` : "cause: —",
      serialized.stack ? `stack:\n${serialized.stack}` : "stack: —",
      `durationMs: ${durationMs}`,
    ]);
    throw error;
  }
}

export function auditPipelineStepSync<T>(
  step: string,
  location: string,
  input: Record<string, unknown>,
  fn: () => T,
  mapOutput?: (result: T) => Record<string, unknown>,
): T {
  const startedAt = Date.now();
  logBlock(`[${step.toUpperCase()}]`, [
    "input:",
    ...Object.entries(input).map(([key, value]) => `  ${key}: ${formatValue(value)}`),
  ]);

  try {
    const result = fn();
    const output = mapOutput ? mapOutput(result) : summarizeValue(result);
    const durationMs = Date.now() - startedAt;
    recordPipelineStep({
      step,
      status: "success",
      location,
      input,
      output,
      durationMs,
      sentenceIndex: typeof input.sentenceIndex === "number" ? input.sentenceIndex : undefined,
    });
    logBlock(`[${step.toUpperCase()}] ✓`, [
      ...Object.entries(output).map(([key, value]) => `${key}: ${formatValue(value)}`),
      `durationMs: ${durationMs}`,
    ]);
    return result;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const serialized = serializeError(error)!;
    recordPipelineStep({
      step,
      status: "failure",
      location,
      input,
      error: serialized,
      durationMs,
      sentenceIndex: typeof input.sentenceIndex === "number" ? input.sentenceIndex : undefined,
    });
    logBlock(`[${step.toUpperCase()}] ✗`, [
      `message: ${serialized.message}`,
      serialized.cause ? `cause: ${serialized.cause}` : "cause: —",
      serialized.stack ? `stack:\n${serialized.stack}` : "stack: —",
      `durationMs: ${durationMs}`,
    ]);
    throw error;
  }
}

export function recordPipelineFailure(
  step: string,
  location: string,
  input: Record<string, unknown>,
  error: unknown,
): void {
  const serialized = serializeError(error)!;
  recordPipelineStep({
    step,
    status: "failure",
    location,
    input,
    error: serialized,
    sentenceIndex: typeof input.sentenceIndex === "number" ? input.sentenceIndex : undefined,
  });
  logBlock(`[${step.toUpperCase()}] ✗ (continued)`, [
    `message: ${serialized.message}`,
    serialized.cause ? `cause: ${serialized.cause}` : "cause: —",
    serialized.stack ? `stack:\n${serialized.stack}` : "stack: —",
  ]);
}

export function getPrimaryPipelineFailure(): PipelineStepRecord | undefined {
  const steps = getStore()?.steps ?? [];
  return [...steps].reverse().find((step) => step.status === "failure");
}

export function formatPipelineAuditReport(): string {
  const store = getStore();
  if (!store) {
    return "Pipeline audit: no audit context (import not wrapped in runImportPipelineAudit).";
  }

  const lines: string[] = ["Pipeline audit report", ""];

  if (store.meta.title) {
    lines.push(`Texte: ${store.meta.title}`);
  }
  if (store.meta.rawTextLength !== undefined) {
    lines.push(`Caractères: ${store.meta.rawTextLength}`);
  }
  if (store.meta.sentenceCount !== undefined) {
    lines.push(`Phrases segmentées: ${store.meta.sentenceCount}`);
  }
  if (store.meta.storedSentenceCount !== undefined) {
    lines.push(`Phrases enregistrées: ${store.meta.storedSentenceCount}`);
  }

  lines.push("");

  const stepOrder = [
    "import",
    "cleanText",
    "segmentSentences",
    "lexicalValidation",
    "textCreate",
    "sanitizeSentence",
    "knowledgeLookup",
    "aiRequest",
    "parseAnalysisResponse",
    "indexFromAnalysis",
    "applyQuality",
    "storage",
    "knowledgeGraph",
    "finalize",
  ];

  const grouped = new Map<string, PipelineStepRecord[]>();
  for (const step of store.steps) {
    const list = grouped.get(step.step) ?? [];
    list.push(step);
    grouped.set(step.step, list);
  }

  for (const stepName of stepOrder) {
    const records = grouped.get(stepName);
    if (!records?.length) {
      continue;
    }
    for (const record of records) {
      const icon = record.status === "success" ? "✓" : record.status === "skipped" ? "○" : "✗";
      const sentence =
        record.sentenceIndex !== undefined ? ` (phrase ${record.sentenceIndex})` : "";
      lines.push(`${icon} ${record.step}${sentence} — ${record.location}`);
      if (record.error) {
        lines.push(`    message: ${record.error.message}`);
        if (record.error.cause) {
          lines.push(`    cause: ${record.error.cause}`);
        }
      }
    }
  }

  for (const [stepName, records] of grouped) {
    if (stepOrder.includes(stepName)) {
      continue;
    }
    for (const record of records) {
      const icon = record.status === "success" ? "✓" : record.status === "skipped" ? "○" : "✗";
      lines.push(`${icon} ${record.step} — ${record.location}`);
      if (record.error) {
        lines.push(`    message: ${record.error.message}`);
      }
    }
  }

  const primary = getPrimaryPipelineFailure();
  if (primary) {
    lines.push("");
    lines.push("Cause racine probable:");
    lines.push(`  étape: ${primary.step}`);
    lines.push(`  fichier: ${primary.location}`);
    lines.push(`  message: ${primary.error?.message ?? "—"}`);
  }

  return lines.join("\n");
}

export function buildImportFailureMessage(baseMessage: string): string {
  const report = formatPipelineAuditReport();
  const primary = getPrimaryPipelineFailure();
  if (!primary) {
    return `${baseMessage}\n\n${report}`;
  }
  return `${baseMessage}\n\nCause: ${primary.step} @ ${primary.location}\n${primary.error?.message ?? ""}\n\n${report}`;
}

function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return previewText(value);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return "—";
  }
  try {
    return previewText(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

function summarizeValue(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    return { size: value.length, preview: previewText(value) };
  }
  if (Array.isArray(value)) {
    return { count: value.length };
  }
  if (value && typeof value === "object") {
    return { keys: Object.keys(value as object).join(", ") };
  }
  return { value: formatValue(value) };
}

export function setCurrentSentenceIndex(index: number | undefined): void {
  setImportPipelineMeta({ currentSentenceIndex: index });
}

export function getCurrentSentenceIndex(): number | undefined {
  return getStore()?.meta.currentSentenceIndex;
}

export function auditPreviewText(value: string, max = 120): string {
  return previewText(value, max);
}
