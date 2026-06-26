import { Card } from "@/components/design-system";
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
    <Card as="article" className="home-ws-queue">
      <div>
        <h3 className="r3-title home-ws-queue__title break-russian font-reader">{item.title}</h3>
        {item.collectionId ? (
          <p className="home-ws-explore-hub__description">{getCollectionName(item.collectionId)}</p>
        ) : null}
        <p className="home-ws-queue__status">{STATUS_LABELS[item.status]}</p>
      </div>

      {isActive ? (
        <div className="space-y-2">
          <ProgressBar value={item.progress} />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="home-ws-explore-hub__description">
              {phraseLabel} · {wordLabel}
            </span>
            {item.enrichmentPending ? (
              <span className="home-ws-report__note">Analyse en cours…</span>
            ) : null}
          </div>
          {item.etaSeconds !== null && isActive && !item.enrichmentPending ? (
            <p className="home-ws-report__note">~{item.etaSeconds} s restantes</p>
          ) : null}
        </div>
      ) : null}

      {item.status === "failed" && item.errorDetails ? (
        <ImportErrorDetails details={item.errorDetails} />
      ) : null}
    </Card>
  );
}
