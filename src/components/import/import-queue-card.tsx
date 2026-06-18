import { getCollectionName } from "@/content/collections";
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
  const isActive = item.status === "processing" || item.enrichmentPending;
  const wordCount = item.result?.wordCount ?? countWords(item.rawText);
  const phraseCount = item.estimatedSentences;
  const readyPhrases =
    item.enrichmentPending && item.sentencesReady === 0
      ? phraseCount
      : Math.max(item.sentencesReady, item.sentencesProcessed);
  const phraseLabel = `${readyPhrases} / ${phraseCount} phrase${phraseCount === 1 ? "" : "s"}`;
  const wordLabel = `${wordCount} mot${wordCount === 1 ? "" : "s"}`;

  return (
    <article
      className={[
        "rounded-xl border px-5 py-4 transition-all duration-300",
        isActive ? "border-[var(--ink-muted)]/30" : "border-[var(--hairline)]",
      ].join(" ")}
    >
      <div className="space-y-1">
        <h3 className="font-reader text-lg text-[var(--ink)]">{item.title}</h3>
        {item.collectionId ? (
          <p className="truncate text-xs text-[var(--ink-muted)]">
            {getCollectionName(item.collectionId)}
          </p>
        ) : null}
        <p className="text-xs text-[var(--ink-secondary)]">{STATUS_LABELS[item.status]}</p>
      </div>

      {isActive ? (
        <div className="mt-4 space-y-2">
          <ProgressBar value={item.progress} />
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-[var(--ink-secondary)]">
            <span>
              {phraseLabel} · {wordLabel}
            </span>
            {item.enrichmentPending ? (
              <span className="text-xs text-[var(--ink-muted)]">Analyse en cours…</span>
            ) : null}
          </div>
          {item.etaSeconds !== null && isActive && !item.enrichmentPending ? (
            <p className="text-xs text-[var(--ink-muted)]">~{item.etaSeconds} s restantes</p>
          ) : item.enrichmentPending && item.etaSeconds !== null ? (
            <p className="text-xs text-[var(--ink-muted)]">~{item.etaSeconds} s restantes</p>
          ) : null}
        </div>
      ) : item.status === "completed" ? (
        <p className="mt-4 text-sm text-[var(--ink-secondary)]">
          {phraseLabel} · {wordLabel}
        </p>
      ) : null}

      {item.errorDetails ? (
        <ImportErrorDetails details={item.errorDetails} />
      ) : item.error ? (
        <p className="mt-3 text-xs text-[var(--ink-secondary)]">{item.error}</p>
      ) : null}
    </article>
  );
}
