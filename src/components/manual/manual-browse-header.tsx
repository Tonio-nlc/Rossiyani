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
    <header className="mb-8 space-y-2">
      <Link
        href={backHref}
        className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline"
      >
        ← {backLabel}
      </Link>
      <h1 className="font-reader text-[clamp(1.75rem,3vw,2.25rem)] font-semibold tracking-tight text-[var(--ink)]">
        {title}
      </h1>
      <p className="max-w-2xl text-sm text-[var(--ink-muted)]">{description}</p>
    </header>
  );
}
