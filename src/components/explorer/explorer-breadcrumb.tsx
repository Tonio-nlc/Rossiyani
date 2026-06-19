import Link from "next/link";

type ExplorerBreadcrumbProps = {
  items: Array<{ label: string; href?: string }>;
};

export function ExplorerBreadcrumb({ items }: ExplorerBreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 text-sm">
      <Link
        href="/explorer"
        className="focus-kb text-[var(--ink-muted)] transition hover:text-[var(--ink)]"
      >
        Explorer
      </Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          <span className="text-[var(--hairline-strong)]">/</span>
          {item.href ? (
            <Link
              href={item.href}
              className="focus-kb text-[var(--ink-muted)] transition hover:text-[var(--ink)]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-[var(--ink)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
