import { Skeleton } from "@/components/ui/skeleton";

export function ReaderExplorerSkeleton() {
  return (
    <div className="reader-ws-explorer__skeleton" aria-hidden>
      <Skeleton className="reader-ws-explorer__skeleton-card" />
      <Skeleton className="reader-ws-explorer__skeleton-card reader-ws-explorer__skeleton-card--short" />
    </div>
  );
}
