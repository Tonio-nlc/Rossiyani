import Link from "next/link";

type BrowseListItem = {
  label: string;
  href: string;
  meta?: string;
};

type BrowseListProps = {
  title: string;
  items: BrowseListItem[];
};

export function BrowseList({ title, items }: BrowseListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <p className="home-section-label">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="focus-kb group flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-4 transition hover:border-[var(--ink-muted)]"
          >
            <span className="font-reader text-[var(--ink)] group-hover:text-[var(--color-link)]">
              {item.label}
            </span>
            {item.meta ? (
              <span className="mt-2 line-clamp-2 text-sm text-[var(--ink-muted)]">{item.meta}</span>
            ) : null}
            <span className="mt-3 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
