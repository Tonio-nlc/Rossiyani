type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} aria-hidden />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="surface-elevated space-y-4 rounded-2xl border border-[var(--border)] p-5">
      <Skeleton className="h-4 w-1/3" />
      <SkeletonText lines={2} />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
