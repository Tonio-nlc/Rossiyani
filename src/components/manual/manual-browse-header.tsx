import Link from "next/link";

type ManualBrowseHeaderProps = {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
};

export function ManualBrowseHeader({
  title,
  description,
  backHref,
  backLabel,
}: ManualBrowseHeaderProps) {
  return (
    <header className="space-y-3 pb-6">
      <Link
        href={backHref}
        className="focus-kb text-xs text-[var(--muted)] transition hover:text-[var(--accent-violet-bright)]"
      >
        ← {backLabel}
      </Link>
      <h1 className="font-reader text-4xl font-semibold tracking-tight text-[var(--foreground)]">
        {title}
      </h1>
      <p className="max-w-2xl text-sm text-[var(--muted)]">{description}</p>
    </header>
  );
}
