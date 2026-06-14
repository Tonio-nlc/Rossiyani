import Link from "next/link";

type DiscoveryItem = {
  label: string;
  href: string;
  meta?: string;
};

type ExplorerDiscoveryGridProps = {
  items: DiscoveryItem[];
};

export function ExplorerDiscoveryGrid({ items }: ExplorerDiscoveryGridProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={`${item.href}-${item.label}`}
          href={item.href}
          className="focus-kb group flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-4 transition hover:border-[var(--ink-muted)]"
        >
          <p className="break-russian font-reader text-base text-[var(--ink)] group-hover:text-[var(--color-link)]">
            {item.label}
          </p>
          {item.meta ? (
            <p className="mt-1 line-clamp-2 text-sm text-[var(--ink-muted)]">{item.meta}</p>
          ) : null}
          <span className="mt-3 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
            Open →
          </span>
        </Link>
      ))}
    </div>
  );
}
