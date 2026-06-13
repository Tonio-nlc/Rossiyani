import Link from "next/link";

type ExplorerBreadcrumbProps = {
  items: Array<{ label: string; href?: string }>;
};

export function ExplorerBreadcrumb({ items }: ExplorerBreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 text-sm">
      <Link
        href="/explorer"
        className="focus-kb text-[var(--muted)] transition hover:text-[var(--accent-violet-bright)]"
      >
        Explorer
      </Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          <span className="text-[var(--border-strong)]">/</span>
          {item.href ? (
            <Link
              href={item.href}
              className="focus-kb text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-[var(--foreground)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
