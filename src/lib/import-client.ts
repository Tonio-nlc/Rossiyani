import type { ImportSegmentStats } from "@/domain/pipeline";
import { segmentSentences } from "@/services/parser/segment-sentences";
import type { ImportRussianTextResult } from "@/services/import/types";
import type { CefrLevel } from "@/types/domain";
import type { KnowledgeMetricsSnapshot } from "@/types/import-pipeline";

const HISTORY_KEY = "rossiyani_import_history";
const MAX_HISTORY = 30;

export type PendingImportFile = {
  id: string;
  fileName: string;
  title: string;
  source: string;
  rawText: string;
  level: CefrLevel;
  estimatedSentences: number;
  fileSizeBytes: number;
  detectedLevel: CefrLevel | null;
};

export type ImportQueueItemStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "skipped";

export type ImportQueueItem = PendingImportFile & {
  status: ImportQueueItemStatus;
  progress: number;
  sentencesProcessed: number;
  knowledgeHits: number;
  aiCalls: number;
  etaSeconds: number | null;
  textId?: string;
  error?: string;
  errorDetails?: import("@/lib/import-error-format").ImportFailureDetails;
  result?: ImportRussianTextResult;
};

export type ImportHistoryEntry = {
  id: string;
  fileName: string;
  title: string;
  source?: string;
  status: "completed" | "failed" | "skipped";
  textId?: string;
  sentenceCount?: number;
  wordCount?: number;
  knowledgeHits?: number;
  aiCalls?: number;
  error?: string;
  completedAt: string;
  jobId?: string;
};

export type ImportSessionReport = {
  textsImported: number;
  textsSkipped: number;
  textsFailed: number;
  sentencesProcessed: number;
  knowledgeHits: number;
  knowledgeMisses: number;
  aiCalls: number;
  conceptsCreated: number;
  collocationsCreated: number;
  knowledgeHitPercent: number;
  aiCallPercent: number;
  quality?: {
    knownWords: number;
    newWordsAnalyzed: number;
    suspiciousWords: number;
    ignoredWords: number;
    suspiciousTokens: Array<{
      word: string;
      suggestion: string | null;
      reasons: string[];
    }>;
  };
  segmentStats?: ImportSegmentStats;
  hasPartialSegments?: boolean;
};

export function hasImportText(rawText: string): boolean {
  return rawText.trim().length > 0;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

export type PastedTextStats = {
  characters: number;
  words: number;
  estimatedSentences: number;
  estimatedReadingMinutes: number;
};

export function analyzePastedText(text: string): PastedTextStats {
  const trimmed = text.trim();
  const estimatedSentences = trimmed ? segmentSentences(trimmed).length : 0;
  return {
    characters: text.length,
    words: countWords(text),
    estimatedSentences,
    estimatedReadingMinutes: Math.max(1, Math.ceil(estimatedSentences * 0.45)),
  };
}

export function isImportTitleValid(title: string): boolean {
  return title.trim().length > 0;
}

export function titleFromPaste(rawText: string): string {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return "Nouveau texte";
  }

  const firstSentence = segmentSentences(trimmed)[0]?.trim() ?? "";
  const firstLine = trimmed.split(/\n/).find((line) => line.trim().length > 0)?.trim() ?? "";
  const candidate = (firstSentence || firstLine || trimmed)
    .slice(0, 56)
    .replace(/\s+/g, " ")
    .trim();

  return candidate.length > 0 ? candidate : "Nouveau texte";
}

export function createPendingFromPaste(
  rawText: string,
  level: CefrLevel,
  metadata?: { title?: string; source?: string },
): PendingImportFile {
  const trimmed = rawText.trim();
  return {
    id: crypto.randomUUID(),
    fileName: "texte-collé.txt",
    title: metadata?.title?.trim() || titleFromPaste(trimmed),
    source: metadata?.source?.trim() ?? "",
    rawText: trimmed,
    level,
    estimatedSentences: segmentSentences(trimmed).length,
    fileSizeBytes: new Blob([trimmed]).size,
    detectedLevel: null,
  };
}

const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "Native"];

export function detectLevelFromFileName(fileName: string): CefrLevel | null {
  for (const level of CEFR_LEVELS) {
    const re = new RegExp(`(^|[^A-Za-z])${level}($|[^A-Za-z])`, "i");
    if (re.test(fileName)) {
      return level;
    }
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} o`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 10_240 ? 1 : 0)} Ko`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function titleFromFileName(fileName: string): string {
  return fileName.replace(/\.(txt|md)$/i, "").replace(/[-_]/g, " ");
}

export async function readImportFile(file: File, level: CefrLevel): Promise<PendingImportFile> {
  const rawText = await file.text();
  const detectedLevel = detectLevelFromFileName(file.name);
  return {
    id: crypto.randomUUID(),
    fileName: file.name,
    title: titleFromFileName(file.name),
    source: "",
    rawText: rawText.trim(),
    level: detectedLevel ?? level,
    estimatedSentences: segmentSentences(rawText).length,
    fileSizeBytes: file.size,
    detectedLevel,
  };
}

export async function readImportFiles(
  files: File[],
  level: CefrLevel,
): Promise<{ accepted: PendingImportFile[]; failedRead: string[] }> {
  const accepted: PendingImportFile[] = [];
  const failedRead: string[] = [];

  for (const file of files) {
    try {
      accepted.push(await readImportFile(file, level));
    } catch {
      failedRead.push(file.name);
    }
  }

  return { accepted, failedRead };
}

export function estimateImportSeconds(sentenceCount: number): number {
  return Math.max(8, Math.round(sentenceCount * 0.85));
}

export function buildSessionReport(
  items: ImportQueueItem[],
  metricsBefore: KnowledgeMetricsSnapshot | null,
  metricsAfter: KnowledgeMetricsSnapshot | null,
): ImportSessionReport {
  const completed = items.filter((i) => i.status === "completed");
  const skipped = items.filter((i) => i.status === "skipped");
  const failed = items.filter((i) => i.status === "failed");

  const knowledgeHits = completed.reduce((s, i) => s + (i.result?.metrics?.knowledgeHits ?? i.knowledgeHits), 0);
  const knowledgeMisses = completed.reduce((s, i) => s + (i.result?.metrics?.knowledgeMisses ?? 0), 0);
  const aiCalls = completed.reduce((s, i) => s + (i.result?.metrics?.aiCalls ?? i.aiCalls), 0);
  const sentencesProcessed = completed.reduce(
    (s, i) => s + (i.result?.sentenceCount ?? i.sentencesProcessed),
    0,
  );

  const totalKnowledge = knowledgeHits + knowledgeMisses;
  const conceptsCreated =
    metricsBefore && metricsAfter
      ? Math.max(0, metricsAfter.graphSize.concepts - metricsBefore.graphSize.concepts)
      : 0;
  const collocationsCreated =
    metricsBefore && metricsAfter
      ? Math.max(0, metricsAfter.graphSize.phrases - metricsBefore.graphSize.phrases)
      : completed.reduce((s, i) => s + (i.result?.phraseGroupCount ?? 0), 0);

  const qualityTokens = new Map<
    string,
    { word: string; suggestion: string | null; reasons: string[]; status: string }
  >();
  let knownWords = 0;
  let newWordsAnalyzed = 0;
  let suspiciousWords = 0;
  let ignoredWords = 0;

  for (const item of completed) {
    const report = item.result?.qualityReport;
    if (!report) {
      continue;
    }
    knownWords += report.knownCount;
    newWordsAnalyzed += report.unknownCount;
    suspiciousWords += report.suspiciousCount;
    ignoredWords += report.invalidCount;

    for (const token of report.tokens) {
      if (token.status !== "SUSPICIOUS" && token.status !== "INVALID") {
        continue;
      }
      qualityTokens.set(token.normalized, {
        word: token.surface,
        suggestion: token.suggestion,
        reasons: token.reasons,
        status: token.status,
      });
    }
  }

  const suspiciousTokens = [...qualityTokens.values()].filter((t) => t.status === "SUSPICIOUS");

  const segmentStats: ImportSegmentStats = {
    total: 0,
    complete: 0,
    partial: 0,
    failed: 0,
    lost: 0,
  };

  for (const item of completed) {
    const stats = item.result?.segmentStats;
    if (!stats) {
      continue;
    }
    segmentStats.total += stats.total;
    segmentStats.complete += stats.complete;
    segmentStats.partial += stats.partial;
    segmentStats.failed += stats.failed;
    segmentStats.lost += stats.lost;
  }

  const hasPartialSegments =
    segmentStats.partial > 0 || segmentStats.failed > 0 || segmentStats.lost > 0;

  return {
    textsImported: completed.length,
    textsSkipped: skipped.length,
    textsFailed: failed.length,
    sentencesProcessed,
    knowledgeHits,
    knowledgeMisses,
    aiCalls,
    conceptsCreated,
    collocationsCreated,
    knowledgeHitPercent: totalKnowledge > 0 ? Math.round((knowledgeHits / totalKnowledge) * 100) : 0,
    aiCallPercent:
      knowledgeHits + aiCalls > 0 ? Math.round((aiCalls / (knowledgeHits + aiCalls)) * 100) : 0,
    quality:
      knownWords + newWordsAnalyzed + suspiciousWords + ignoredWords > 0
        ? {
            knownWords,
            newWordsAnalyzed,
            suspiciousWords,
            ignoredWords,
            suspiciousTokens,
          }
        : undefined,
    segmentStats: segmentStats.total > 0 ? segmentStats : undefined,
    hasPartialSegments,
  };
}

export function loadImportHistory(): ImportHistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ImportHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveImportHistoryEntry(entry: ImportHistoryEntry): void {
  const existing = loadImportHistory();
  const next = [entry, ...existing.filter((e) => e.id !== entry.id)].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}
