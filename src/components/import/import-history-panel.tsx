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

function statusBadgeClass(status: string): string {
  switch (status) {
    case "completed":
    case "COMPLETED":
      return "home-ws-badge";
    case "failed":
    case "FAILED":
      return "home-ws-badge home-ws-badge--muted";
    case "PROCESSING":
      return "home-ws-badge";
    case "skipped":
    case "PENDING":
    case "PAUSED":
    default:
      return "home-ws-badge home-ws-badge--muted";
  }
}

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
      <section className="home-ws-section">
        <h2 className="home-ws-section__title">Historique</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer h-20 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!hasEntries) {
    return showOnboarding ? <ImportOnboarding /> : null;
  }

  return (
    <section className="home-ws-section" aria-labelledby="import-history-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="import-history-heading" className="home-ws-section__title">
          Historique
        </h2>
        {onViewReport ? (
          <button type="button" onClick={onViewReport} className="home-ws-link focus-kb">
            Voir le rapport
          </button>
        ) : null}
      </div>

      <ul className="home-ws-history-list">
        {localHistory.map((entry) => (
          <HistoryRow
            key={entry.id}
            title={entry.title}
            collection={entry.collectionId ? getCollectionName(entry.collectionId) : "—"}
            meta={`${formatDate(entry.completedAt)} · ${entry.wordCount ?? 0} mots · ${entry.sentenceCount ?? 0} phrases`}
            status={entry.status}
            action={
              entry.status === "failed" && onRetry ? (
                <button
                  type="button"
                  onClick={() => onRetry(entry)}
                  className="home-ws-btn home-ws-btn--ghost home-ws-btn--pill home-ws-btn--sm focus-kb"
                >
                  Relancer
                </button>
              ) : entry.textId ? (
                <Link
                  href={`/texts/${entry.textId}`}
                  className="home-ws-btn home-ws-btn--ghost home-ws-btn--pill home-ws-btn--sm focus-kb"
                >
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
            meta={`${job.sentencesProcessed} mots traités · ${job.totalFiles} fichiers`}
            status={job.status}
            action={
              job.status === "FAILED" || job.status === "PAUSED" ? (
                <button
                  type="button"
                  onClick={() => onResumeJob?.(job.id)}
                  className="home-ws-btn home-ws-btn--ghost home-ws-btn--pill home-ws-btn--sm focus-kb"
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
  meta,
  status,
  action,
}: {
  title: string;
  collection: string;
  meta: string;
  status: string;
  action?: React.ReactNode;
}) {
  return (
    <li>
      <article className="home-ws-card home-ws-history-item">
        <div className="home-ws-history-item__main">
          <p className="home-ws-metric__label">{collection}</p>
          <h3 className="home-ws-card-title truncate break-russian font-reader">{title}</h3>
          <p className="home-ws-history-item__meta">{meta}</p>
        </div>
        <div className="home-ws-history-item__aside">
          <span className={statusBadgeClass(status)}>{statusLabel(status)}</span>
          {action}
        </div>
      </article>
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
