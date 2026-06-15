"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useToast } from "@/components/ui/toast-provider";
import type { ImportJobSummary } from "@/features/bulk-import";
import type { KnowledgeMetricsSnapshot } from "@/types/import-pipeline";
import type { CefrLevel } from "@/types/domain";
import type { ImportRussianTextResult } from "@/services/import/types";
import {
  buildSessionReport,
  countWords,
  createPendingFromPaste,
  estimateImportSeconds,
  hasImportText,
  isImportTitleValid,
  loadImportHistory,
  readImportFiles,
  saveImportHistoryEntry,
  type ImportFileProgressCallback,
  type ImportHistoryEntry,
  type ImportQueueItem,
  type ImportSessionReport,
  type PendingImportFile,
} from "@/lib/import-client";
import { formatImportFailure } from "@/lib/import-error-format";
import type { ImportParsePhase } from "@/services/import/parsers";

import { ImportExtractionProgress } from "./import-extraction-progress";

import { ImportFilePreview } from "./import-file-preview";
import { ImportHistoryPanel } from "./import-history-panel";
import { ImportQueueCard } from "./import-queue-card";
import { ImportReportCard } from "./import-report-card";
import { ImportSources } from "./import-sources";

const ADMIN_SECRET_KEY = "rossiyani_admin_secret";

type ImportWorkspaceProps = {
  initialJobs: ImportJobSummary[];
};

export function ImportWorkspace({ initialJobs }: ImportWorkspaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [defaultLevel, setDefaultLevel] = useState<CefrLevel>("B1");
  const [pastedText, setPastedText] = useState("");
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteSource, setPasteSource] = useState("");
  const [staged, setStaged] = useState<PendingImportFile[]>([]);
  const [staging, setStaging] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<{
    fileName: string;
    phase: ImportParsePhase;
    fileIndex: number;
    totalFiles: number;
  } | null>(null);
  const [queue, setQueue] = useState<ImportQueueItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [report, setReport] = useState<ImportSessionReport | null>(null);
  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);
  const [serverJobs, setServerJobs] = useState<ImportJobSummary[]>(initialJobs);
  const [processing, setProcessing] = useState(false);
  const [retryFiles, setRetryFiles] = useState<Map<string, PendingImportFile>>(new Map());
  const metricsBeforeRef = useRef<KnowledgeMetricsSnapshot | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setHistory(loadImportHistory());
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) {
      return;
    }
    requestAnimationFrame(() => {
      document.getElementById(`import-${hash}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const secret = sessionStorage.getItem(ADMIN_SECRET_KEY);
    if (secret?.trim()) {
      headers.Authorization = `Bearer ${secret.trim()}`;
    }
    return headers;
  }, []);

  const fetchMetrics = useCallback(async (): Promise<KnowledgeMetricsSnapshot | null> => {
    try {
      const res = await fetch("/api/admin/metrics", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = (await res.json()) as { metrics: KnowledgeMetricsSnapshot };
        return data.metrics;
      }
    } catch {
      /* ignore */
    }
    return null;
  }, [getAuthHeaders]);

  const refreshServerJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/import/jobs", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = (await res.json()) as { jobs: ImportJobSummary[] };
        setServerJobs(data.jobs);
      }
    } catch {
      /* ignore */
    }
  }, [getAuthHeaders]);

  const updateItem = useCallback((id: string, patch: Partial<ImportQueueItem>) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const startProgressSimulation = useCallback(
    (item: ImportQueueItem) => {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }

      const totalSeconds = estimateImportSeconds(item.estimatedSentences);
      const started = Date.now();

      progressTimerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - started) / 1000;
        const ratio = Math.min(elapsed / totalSeconds, 0.92);
        const sentencesProcessed = Math.min(
          item.estimatedSentences,
          Math.round(item.estimatedSentences * ratio),
        );
        const eta = Math.max(0, Math.round(totalSeconds - elapsed));

        updateItem(item.id, {
          progress: Math.round(ratio * 100),
          sentencesProcessed,
          etaSeconds: eta,
        });
      }, 400);
    },
    [updateItem],
  );

  const stopProgressSimulation = useCallback(() => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const importOne = useCallback(
    async (item: ImportQueueItem): Promise<ImportQueueItem> => {
      setActiveId(item.id);
      updateItem(item.id, { status: "processing", progress: 0, sentencesProcessed: 0 });
      startProgressSimulation(item);

      try {
        const res = await fetch("/api/admin/texts/import", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: item.title.trim(),
            level: item.level,
            source: item.source.trim() || undefined,
            rawText: item.rawText,
          }),
        });

        const data = (await res.json()) as ImportRussianTextResult & { error?: string };

        stopProgressSimulation();

        if (!res.ok) {
          const errorMessage = data.error ?? "Import échoué";
          const errorDetails = formatImportFailure(
            {
              rawText: item.rawText,
              estimatedSentences: item.estimatedSentences,
              fileName: item.fileName,
              fromPaste: item.fileName === "texte-collé.txt",
            },
            errorMessage,
          );
          const failed: ImportQueueItem = {
            ...item,
            status: "failed",
            progress: 100,
            error: errorMessage,
            errorDetails,
            etaSeconds: null,
          };
          updateItem(item.id, failed);
          saveImportHistoryEntry({
            id: item.id,
            fileName: item.fileName,
            title: item.title,
            source: item.source.trim() || undefined,
            status: "failed",
            sentenceCount: item.estimatedSentences,
            wordCount: countWords(item.rawText),
            error: errorMessage,
            completedAt: new Date().toISOString(),
          });
          toast(`Échec : ${item.title}`, "error");
          return failed;
        }

        if (data.skippedDuplicate) {
          const skipped: ImportQueueItem = {
            ...item,
            status: "skipped",
            progress: 100,
            sentencesProcessed: data.sentenceCount,
            etaSeconds: null,
            result: data,
          };
          updateItem(item.id, skipped);
          saveImportHistoryEntry({
            id: item.id,
            fileName: item.fileName,
            title: item.title,
            source: item.source.trim() || undefined,
            status: "skipped",
            sentenceCount: data.sentenceCount,
            wordCount: countWords(item.rawText),
            completedAt: new Date().toISOString(),
          });
          toast(`« ${item.title} » — doublon ignoré`, "info");
          return skipped;
        }

        const completed: ImportQueueItem = {
          ...item,
          status: "completed",
          progress: 100,
          sentencesProcessed: data.sentenceCount,
          knowledgeHits: data.metrics?.knowledgeHits ?? 0,
          aiCalls: data.metrics?.aiCalls ?? 0,
          etaSeconds: null,
          textId: data.textId,
          result: data,
        };
        updateItem(item.id, completed);
        saveImportHistoryEntry({
          id: item.id,
          fileName: item.fileName,
          title: item.title,
          source: item.source.trim() || undefined,
          status: "completed",
          textId: data.textId,
          sentenceCount: data.sentenceCount,
          wordCount: data.wordCount,
          knowledgeHits: data.metrics?.knowledgeHits,
          aiCalls: data.metrics?.aiCalls,
          completedAt: new Date().toISOString(),
        });
        toast(`« ${item.title} » ajouté à la bibliothèque`, "success");
        return completed;
      } catch {
        stopProgressSimulation();
        const errorMessage = "Erreur réseau";
        const errorDetails = formatImportFailure(
          {
            rawText: item.rawText,
            estimatedSentences: item.estimatedSentences,
            fileName: item.fileName,
            fromPaste: item.fileName === "texte-collé.txt",
          },
          errorMessage,
        );
        const failed: ImportQueueItem = {
          ...item,
          status: "failed",
          progress: 100,
          error: errorMessage,
          errorDetails,
          etaSeconds: null,
        };
        updateItem(item.id, failed);
        toast(`Erreur réseau : ${item.title}`, "error");
        return failed;
      } finally {
        setActiveId(null);
      }
    },
    [getAuthHeaders, startProgressSimulation, stopProgressSimulation, toast, updateItem],
  );

  const processQueue = useCallback(
    async (items: ImportQueueItem[]): Promise<ImportQueueItem[]> => {
      setProcessing(true);
      metricsBeforeRef.current = await fetchMetrics();

      const results: ImportQueueItem[] = [];
      for (const item of items) {
        if (item.status === "completed" || item.status === "skipped") {
          results.push(item);
          continue;
        }
        const result = await importOne({ ...item, status: "pending" });
        results.push(result);
      }

      const metricsAfter = await fetchMetrics();
      setReport(buildSessionReport(results, metricsBeforeRef.current, metricsAfter));
      setHistory(loadImportHistory());
      await refreshServerJobs();
      setProcessing(false);
      return results;
    },
    [fetchMetrics, importOne, refreshServerJobs],
  );

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      setStaging(true);
      setExtractionProgress(null);
      try {
        const onProgress: ImportFileProgressCallback = (fileName, phase, fileIndex, totalFiles) => {
          setExtractionProgress({ fileName, phase, fileIndex, totalFiles });
        };

        const { accepted, failedRead } = await readImportFiles(files, defaultLevel, onProgress);
        if (accepted.length === 0) {
          const firstFailure = failedRead[0];
          toast(
            firstFailure?.error ??
              (failedRead.length > 0 ? "Impossible de lire le(s) fichier(s)" : "Aucun fichier sélectionné"),
            "error",
          );
          return;
        }
        if (failedRead.length > 0) {
          for (const failure of failedRead) {
            toast(`${failure.fileName} : ${failure.error}`, "error");
          }
        }
        setStaged((prev) => {
          const existingNames = new Set(prev.map((p) => p.fileName));
          const novel = accepted.filter((p) => !existingNames.has(p.fileName));
          return [...prev, ...novel];
        });
        setReport(null);
        setRetryFiles((prev) => {
          const next = new Map(prev);
          accepted.forEach((p) => next.set(p.id, p));
          return next;
        });
      } finally {
        setStaging(false);
        setExtractionProgress(null);
      }
    },
    [defaultLevel, toast],
  );

  const handleStagedTitleChange = useCallback((id: string, title: string) => {
    setStaged((prev) => prev.map((file) => (file.id === id ? { ...file, title } : file)));
    setRetryFiles((prev) => {
      const next = new Map(prev);
      const file = next.get(id);
      if (file) {
        next.set(id, { ...file, title });
      }
      return next;
    });
  }, []);

  const handleStagedSourceChange = useCallback((id: string, source: string) => {
    setStaged((prev) => prev.map((file) => (file.id === id ? { ...file, source } : file)));
    setRetryFiles((prev) => {
      const next = new Map(prev);
      const file = next.get(id);
      if (file) {
        next.set(id, { ...file, source });
      }
      return next;
    });
  }, []);

  const handleStagedLevelChange = useCallback((id: string, level: CefrLevel) => {
    setStaged((prev) =>
      prev.map((file) => (file.id === id ? { ...file, level } : file)),
    );
    setRetryFiles((prev) => {
      const next = new Map(prev);
      const file = next.get(id);
      if (file) {
        next.set(id, { ...file, level });
      }
      return next;
    });
  }, []);

  const handleRemoveStaged = useCallback((id: string) => {
    setStaged((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleCancelStaged = useCallback(() => {
    setStaged([]);
  }, []);

  const handleStartImport = useCallback(async () => {
    if (staged.length === 0 || processing) {
      return;
    }

    if (!staged.every((file) => isImportTitleValid(file.title))) {
      toast("Renseignez le nom de chaque texte avant l'import.", "error");
      return;
    }

    const queueItems: ImportQueueItem[] = staged.map((p) => ({
      ...p,
      status: "pending",
      progress: 0,
      sentencesProcessed: 0,
      knowledgeHits: 0,
      aiCalls: 0,
      etaSeconds: null,
    }));

    setStaged([]);
    setQueue((prev) => [...prev, ...queueItems]);
    await processQueue(queueItems);
  }, [processQueue, processing, staged, toast]);

  const handlePasteAnalyze = useCallback(async () => {
    if (!hasImportText(pastedText) || processing) {
      return;
    }

    if (!isImportTitleValid(pasteTitle)) {
      toast("Le nom du texte est obligatoire.", "error");
      return;
    }

    const pending = createPendingFromPaste(pastedText, defaultLevel, {
      title: pasteTitle,
      source: pasteSource,
    });
    const item: ImportQueueItem = {
      ...pending,
      status: "pending",
      progress: 0,
      sentencesProcessed: 0,
      knowledgeHits: 0,
      aiCalls: 0,
      etaSeconds: null,
    };

    setPastedText("");
    setPasteTitle("");
    setPasteSource("");
    setReport(null);
    setRetryFiles((prev) => {
      const next = new Map(prev);
      next.set(pending.id, pending);
      return next;
    });
    setQueue([item]);

    const results = await processQueue([item]);
    const imported = results.find((r) => r.status === "completed" && r.textId);
    if (imported?.textId) {
      router.push(`/texts/${imported.textId}`);
    }
  }, [defaultLevel, pasteSource, pasteTitle, pastedText, processing, processQueue, router, toast]);

  const handleRetry = useCallback(
    (entry: ImportHistoryEntry) => {
      const file = retryFiles.get(entry.id);
      if (!file) {
        toast("Fichier non disponible — déposez-le à nouveau", "info");
        return;
      }
      const item: ImportQueueItem = {
        ...file,
        status: "pending",
        progress: 0,
        sentencesProcessed: 0,
        knowledgeHits: 0,
        aiCalls: 0,
        etaSeconds: null,
      };
      setQueue((prev) => [...prev, item]);
      void processQueue([item]);
    },
    [processQueue, retryFiles, toast],
  );

  const handleResumeJob = useCallback(
    async (jobId: string) => {
      try {
        const res = await fetch(`/api/admin/import/jobs/${jobId}`, {
          method: "POST",
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          toast("Import repris", "success");
          await refreshServerJobs();
        } else {
          toast("Impossible de reprendre l'import", "error");
        }
      } catch {
        toast("Erreur réseau", "error");
      }
    },
    [getAuthHeaders, refreshServerJobs, toast],
  );

  const activeItem = queue.find((i) => i.id === activeId) ?? queue.find((i) => i.status === "processing");
  const failedItems = queue.filter((i) => i.status === "failed" && i.errorDetails);
  const completedTextId = queue.find((i) => i.status === "completed" && i.textId)?.textId;

  return (
    <div className="space-y-10 pb-16">
      <header className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-violet-bright)]">
          Lecture rapide
        </p>
        <h1 className="font-reader text-4xl font-semibold tracking-tight sm:text-5xl">Import</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Créez une entrée dans votre bibliothèque : nommez le texte, indiquez sa source et son
          niveau, puis importez du russe depuis le presse-papier ou un fichier.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <Link href="/library" className="focus-kb text-sm text-[var(--accent-violet-bright)] hover:underline">
          Voir la bibliothèque →
        </Link>
      </div>

      {extractionProgress ? (
        <ImportExtractionProgress
          fileName={extractionProgress.fileName}
          phase={extractionProgress.phase}
          fileIndex={extractionProgress.fileIndex}
          totalFiles={extractionProgress.totalFiles}
        />
      ) : null}

      {staged.length > 0 ? (
        <ImportFilePreview
          files={staged}
          disabled={processing || staging}
          onTitleChange={handleStagedTitleChange}
          onSourceChange={handleStagedSourceChange}
          onLevelChange={handleStagedLevelChange}
          onRemove={handleRemoveStaged}
          onImport={() => void handleStartImport()}
          onCancel={handleCancelStaged}
        />
      ) : (
        <ImportSources
          pastedText={pastedText}
          pasteTitle={pasteTitle}
          pasteSource={pasteSource}
          defaultLevel={defaultLevel}
          disabled={processing || staging}
          onPastedTextChange={setPastedText}
          onPasteTitleChange={setPasteTitle}
          onPasteSourceChange={setPasteSource}
          onLevelChange={setDefaultLevel}
          onPasteAnalyze={() => void handlePasteAnalyze()}
          onFiles={(files) => void handleFilesSelected(files)}
        />
      )}

      {activeItem ? (
        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            En cours
          </h2>
          <ImportQueueCard item={activeItem} />
        </section>
      ) : null}

      {!activeItem && failedItems.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Échec d&apos;import
          </h2>
          {failedItems.map((item) => (
            <ImportQueueCard key={item.id} item={item} />
          ))}
        </section>
      ) : null}

      {report ? (
        <section className="space-y-3">
          <ImportReportCard report={report} />
          <div className="flex flex-wrap gap-3">
            {completedTextId ? (
              <Link
                href={`/texts/${completedTextId}`}
                className="btn-primary focus-kb rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                Lire maintenant
              </Link>
            ) : null}
            <Link href="/library" className="focus-kb rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm">
              Ouvrir la bibliothèque
            </Link>
            <Link href="/explorer" className="focus-kb rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm">
              Explorer le graphe
            </Link>
          </div>
        </section>
      ) : null}

      <div id="import-history" className="scroll-mt-24">
        <ImportHistoryPanel
          localHistory={history}
          serverJobs={serverJobs}
          onRetry={handleRetry}
          onResumeJob={(id) => void handleResumeJob(id)}
          onViewReport={report ? () => window.scrollTo({ top: 0, behavior: "smooth" }) : undefined}
        />
      </div>
    </div>
  );
}
