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
  completed: "import-ws-history__status--completed",
  failed: "import-ws-history__status--failed",
  skipped: "import-ws-history__status--skipped",
  COMPLETED: "import-ws-history__status--completed",
  FAILED: "import-ws-history__status--failed",
  PROCESSING: "import-ws-history__status--processing",
  PENDING: "import-ws-history__status--pending",
  PAUSED: "import-ws-history__status--pending",
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
      <section className="import-ws-section">
        <h2 className="import-ws-section__title">Historique</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer h-12" />
          ))}
        </div>
      </section>
    );
  }

  if (!hasEntries) {
    return showOnboarding ? <ImportOnboarding /> : null;
  }

  return (
    <section className="import-ws-section" aria-labelledby="import-history-heading">
      <div className="import-ws-history__head">
        <h2 id="import-history-heading" className="import-ws-section__title">
          Historique
        </h2>
        {onViewReport ? (
          <button
            type="button"
            onClick={onViewReport}
            className="import-ws-history__link focus-kb"
          >
            Voir le rapport
          </button>
        ) : null}
      </div>

      <ul className="import-ws-history__list">
        {localHistory.map((entry) => (
          <HistoryRow
            key={entry.id}
            title={entry.title}
            collection={
              entry.collectionId ? getCollectionName(entry.collectionId) : "—"
            }
            date={formatDate(entry.completedAt)}
            words={entry.wordCount ?? 0}
            sentences={entry.sentenceCount ?? 0}
            status={entry.status}
            action={
              entry.status === "failed" && onRetry ? (
                <button
                  type="button"
                  onClick={() => onRetry(entry)}
                  className="import-ws-history__link focus-kb"
                >
                  Relancer
                </button>
              ) : entry.textId ? (
                <Link href={`/texts/${entry.textId}`} className="import-ws-history__link focus-kb">
                  Ouvrir
                </Link>
              ) : null
            }
          />
        ))}

        {serverJobs.map((job) => (
          <HistoryRow
            key={job.id}
            title={job.name}
            collection="Import groupé"
            date="—"
            words={job.sentencesProcessed}
            sentences={job.totalFiles}
            status={job.status}
            action={
              job.status === "FAILED" || job.status === "PAUSED" ? (
                <button
                  type="button"
                  onClick={() => onResumeJob?.(job.id)}
                  className="import-ws-history__link focus-kb"
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
  collection,
  date,
  words,
  sentences,
  status,
  action,
}: {
  title: string;
  collection: string;
  date: string;
  words: number;
  sentences: number;
  status: string;
  action?: React.ReactNode;
}) {
  return (
    <li className="import-ws-history__row">
      <p className="import-ws-history__title truncate">{title}</p>
      <p className="import-ws-history__cell import-ws-history__cell--collection truncate">
        {collection}
      </p>
      <p className="import-ws-history__cell">{date}</p>
      <p className="import-ws-history__cell">{words}</p>
      <p className="import-ws-history__cell">{sentences}</p>
      <span className={`import-ws-history__status ${STATUS_CLASS[status] ?? ""}`}>
        {statusLabel(status)}
      </span>
      <div className="import-ws-history__actions">{action}</div>
    </li>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
