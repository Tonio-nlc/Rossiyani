import Link from "next/link";

type ExplorerCategoryCardProps = {
  href: string;
  icon: string;
  label: string;
  description: string;
  count?: number | string;
  delay?: number;
};

export function ExplorerCategoryCard({
  href,
  icon,
  label,
  description,
  count,
  delay = 0,
}: ExplorerCategoryCardProps) {
  return (
    <Link
      href={href}
      className="focus-kb card-hover surface-elevated group flex flex-col rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-soft)] outline-none animate-fade-up sm:p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-3xl" aria-hidden>
        {icon}
      </span>
      <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--accent-violet-bright)]">
        {label}
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      {count !== undefined ? (
        <p className="mt-4 text-xs font-medium text-[var(--accent-cyan)]">
          {typeof count === "number" ? count.toLocaleString("fr-FR") : count} entrées
        </p>
      ) : null}
    </Link>
  );
}
