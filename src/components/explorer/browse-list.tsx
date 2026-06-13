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
    <section className="space-y-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {title}
      </h2>
      <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="focus-kb card-hover flex items-center justify-between gap-4 px-4 py-3 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-[var(--surface-elevated)]"
            >
              <span className="font-reader text-[var(--foreground)]">{item.label}</span>
              {item.meta ? (
                <span className="shrink-0 text-xs text-[var(--muted)]">{item.meta}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
