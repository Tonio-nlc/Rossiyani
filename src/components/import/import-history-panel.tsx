"use client";

import Link from "next/link";

import type { ImportJobSummary } from "@/features/bulk-import";
import { getCollectionName } from "@/content/collections";
import type { ImportHistoryEntry } from "@/lib/import-client";

import { ImportOnboarding } from "./import-onboarding";

type ImportHistoryPanelProps = {
  localHistory: ImportHistoryEntry[];
  serverJobs: ImportJobSummary[];
  onRetry?: (entry: ImportHistoryEntry) => void;
  onResumeJob?: (jobId: string) => void;
  onViewReport?: () => void;
  loading?: boolean;
  showOnboarding?: boolean;
};

const STATUS_CLASS: Record<string, string> = {
  completed: "import-history__status--completed",
  failed: "import-history__status--failed",
  skipped: "import-history__status--skipped",
  COMPLETED: "import-history__status--completed",
  FAILED: "import-history__status--failed",
  PROCESSING: "import-history__status--processing",
  PENDING: "import-history__status--pending",
  PAUSED: "import-history__status--pending",
};

export function ImportHistoryPanel({
  localHistory,
  serverJobs,
  onRetry,
  onResumeJob,
  onViewReport,
  loading,
  showOnboarding = false,
}: ImportHistoryPanelProps) {
  const hasEntries = localHistory.length > 0 || serverJobs.length > 0;

  if (loading) {
    return (
      <section className="import-history">
        <h2 className="import-section-label">Historique</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer h-16 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!hasEntries) {
    return showOnboarding ? <ImportOnboarding /> : null;
  }

  return (
    <section className="import-history">
      <div className="flex items-center justify-between">
        <h2 className="import-section-label">Historique</h2>
        {onViewReport ? (
          <button
            type="button"
            onClick={onViewReport}
            className="import-report__link focus-kb border-none bg-transparent p-0"
          >
            Voir le rapport
          </button>
        ) : null}
      </div>

      <ul className="import-history__list">
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
                  className="import-report__link focus-kb border-none bg-transparent p-0"
                >
                  Relancer
                </button>
              ) : entry.textId ? (
                <Link href={`/texts/${entry.textId}`} className="import-report__link focus-kb">
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
                  className="import-report__link focus-kb border-none bg-transparent p-0"
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
    <li className="import-history__row">
      <div className="min-w-0">
        <p className="import-history__title truncate">{title}</p>
        <p className="import-history__meta truncate">{meta}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={`import-history__status ${STATUS_CLASS[status] ?? ""}`}>
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
