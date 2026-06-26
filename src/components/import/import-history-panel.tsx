"use client";

import type { ReactNode } from "react";

import { Badge, Card, GhostButton, TextButton, type BadgeTone } from "@/components/design-system";
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

function statusBadgeTone(status: string): BadgeTone {
  switch (status) {
    case "completed":
    case "COMPLETED":
    case "PROCESSING":
      return "blue";
    case "failed":
    case "FAILED":
      return "rose";
    default:
      return "neutral";
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
        <h2 className="r3-title home-ws-section__title">Historique</h2>
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
        <h2 id="import-history-heading" className="r3-title home-ws-section__title">
          Historique
        </h2>
        {onViewReport ? (
          <TextButton onClick={onViewReport}>Voir le rapport</TextButton>
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
                <GhostButton small onClick={() => onRetry(entry)}>
                  Relancer
                </GhostButton>
              ) : entry.textId ? (
                <GhostButton small href={`/texts/${entry.textId}`}>
                  Ouvrir
                </GhostButton>
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
                <GhostButton small onClick={() => onResumeJob?.(job.id)}>
                  Reprendre
                </GhostButton>
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
  action?: ReactNode;
}) {
  return (
    <li>
      <Card as="article" className="home-ws-history-item">
        <div className="home-ws-history-item__main">
          <p className="home-ws-metric__label">{collection}</p>
          <h3 className="r3-title home-ws-card-title truncate break-russian">{title}</h3>
          <p className="home-ws-history-item__meta">{meta}</p>
        </div>
        <div className="home-ws-history-item__aside">
          <Badge tone={statusBadgeTone(status)}>{statusLabel(status)}</Badge>
          {action}
        </div>
      </Card>
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
