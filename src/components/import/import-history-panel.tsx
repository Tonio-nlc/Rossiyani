"use client";

import Link from "next/link";

import type { ImportJobSummary } from "@/features/bulk-import";
import { getCollectionName } from "@/content/collections";
import type { ImportHistoryEntry } from "@/lib/import-client";

type ImportHistoryPanelProps = {
  localHistory: ImportHistoryEntry[];
  serverJobs: ImportJobSummary[];
  onRetry?: (entry: ImportHistoryEntry) => void;
  onResumeJob?: (jobId: string) => void;
  onViewReport?: () => void;
  loading?: boolean;
};

const STATUS_STYLES: Record<string, string> = {
  completed: "text-[var(--accent-cyan-bright)]",
  failed: "text-red-300",
  skipped: "text-[var(--muted)]",
  COMPLETED: "text-[var(--accent-cyan-bright)]",
  FAILED: "text-red-300",
  PROCESSING: "text-[var(--accent-violet-bright)]",
  PENDING: "text-[var(--muted)]",
};

export function ImportHistoryPanel({
  localHistory,
  serverJobs,
  onRetry,
  onResumeJob,
  onViewReport,
  loading,
}: ImportHistoryPanelProps) {
  const hasEntries = localHistory.length > 0 || serverJobs.length > 0;

  if (loading) {
    return (
      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Historique
        </h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer h-16 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!hasEntries) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Historique
        </h2>
        {onViewReport ? (
          <button
            type="button"
            onClick={onViewReport}
            className="focus-kb text-xs text-[var(--accent-violet-bright)] hover:underline"
          >
            Voir le rapport
          </button>
        ) : null}
      </div>

      <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {localHistory.map((entry) => (
          <HistoryRow
            key={entry.id}
            title={entry.title}
            meta={formatLocalMeta(entry)}
            status={entry.status}
            action={
              entry.status === "failed" && onRetry ? (
                <button
                  type="button"
                  onClick={() => onRetry(entry)}
                  className="focus-kb text-xs text-[var(--accent-violet-bright)] hover:underline"
                >
                  Relancer
                </button>
              ) : entry.textId ? (
                <Link
                  href={`/texts/${entry.textId}`}
                  className="focus-kb text-xs text-[var(--accent-violet-bright)] hover:underline"
                >
                  Lire
                </Link>
              ) : null
            }
          />
        ))}

        {serverJobs.map((job) => (
          <HistoryRow
            key={job.id}
            title={job.name}
            meta={`${job.processedFiles}/${job.totalFiles} fichiers · ${job.sentencesProcessed} phrases`}
            status={job.status}
            action={
              job.status === "FAILED" || job.status === "PAUSED" ? (
                <button
                  type="button"
                  onClick={() => onResumeJob?.(job.id)}
                  className="focus-kb text-xs text-[var(--accent-violet-bright)] hover:underline"
                >
                  Reprendre
                </button>
              ) : null
            }
          />
        ))}
      </ul>
    </section>
  );
}

function HistoryRow({
  title,
  meta,
  status,
  action,
}: {
  title: string;
  meta: string;
  status: string;
  action?: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium text-[var(--foreground)]">{title}</p>
        <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{meta}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={`text-xs font-medium capitalize ${STATUS_STYLES[status] ?? ""}`}>
          {statusLabel(status)}
        </span>
        {action}
      </div>
    </li>
  );
}

function formatLocalMeta(entry: ImportHistoryEntry): string {
  const collectionLabel = entry.collectionId ? getCollectionName(entry.collectionId) : null;
  const date = new Date(entry.completedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (entry.status === "skipped") {
    return [collectionLabel, date, "Doublon ignoré"].filter(Boolean).join(" · ");
  }

  if (entry.status === "failed") {
    return [collectionLabel, date, entry.error ?? "Échec"].filter(Boolean).join(" · ");
  }

  const parts = [
    collectionLabel,
    date,
    `${entry.sentenceCount ?? 0} phrase${(entry.sentenceCount ?? 0) > 1 ? "s" : ""}`,
    `${entry.wordCount ?? 0} mot${(entry.wordCount ?? 0) > 1 ? "s" : ""}`,
  ].filter(Boolean);

  return parts.join(" · ");
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    completed: "Terminé",
    failed: "Échoué",
    skipped: "Ignoré",
    COMPLETED: "Terminé",
    FAILED: "Échoué",
    PROCESSING: "En cours",
    PENDING: "En attente",
    PAUSED: "En pause",
  };
  return map[status] ?? status;
}
