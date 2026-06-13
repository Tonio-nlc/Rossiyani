import { ProgressBar } from "@/components/ui/progress-bar";
import { countWords } from "@/lib/import-client";
import type { ImportQueueItem } from "@/lib/import-client";

import { ImportErrorDetails } from "./import-error-details";

type ImportQueueCardProps = {
  item: ImportQueueItem;
};

const STATUS_LABELS: Record<ImportQueueItem["status"], string> = {
  pending: "En attente",
  processing: "Analyse en cours",
  completed: "Terminé",
  failed: "Échec",
  skipped: "Doublon ignoré",
};

export function ImportQueueCard({ item }: ImportQueueCardProps) {
  const isActive = item.status === "processing";
  const wordCount = item.result?.wordCount ?? countWords(item.rawText);

  return (
    <article
      className={[
        "surface-elevated rounded-2xl border p-5 transition-all duration-300",
        isActive ? "border-[var(--accent-violet)]/40 shadow-[var(--shadow-glow)]" : "border-[var(--border)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-reader text-lg font-semibold text-[var(--foreground)]">{item.title}</h3>
          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
            {item.source ? `${item.source} · ` : ""}
            {item.fileName}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">{STATUS_LABELS[item.status]}</p>
        </div>
        {item.etaSeconds !== null && isActive ? (
          <p className="shrink-0 text-xs text-[var(--accent-cyan)]">
            ~{item.etaSeconds} s restantes
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <ProgressBar value={item.progress} />
        <p className="mt-2 text-sm text-[var(--muted)]">
          {item.sentencesProcessed} / {item.estimatedSentences} phrases
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Mots</dt>
          <dd className="mt-0.5 font-semibold">{wordCount}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Hits cache</dt>
          <dd className="mt-0.5 font-semibold text-[var(--accent-cyan-bright)]">{item.knowledgeHits}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Appels IA</dt>
          <dd className="mt-0.5 font-semibold">{item.aiCalls}</dd>
        </div>
      </dl>

      {item.errorDetails ? (
        <ImportErrorDetails details={item.errorDetails} />
      ) : item.error ? (
        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {item.error}
        </p>
      ) : null}
    </article>
  );
}
