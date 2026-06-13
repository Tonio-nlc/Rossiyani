import Link from "next/link";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
  children?: ReactNode;
};

export function EmptyState({ icon = "✦", title, description, action, children }: EmptyStateProps) {
  return (
    <div className="surface-elevated flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] px-8 py-16 text-center animate-fade-up sm:py-20">
      <span className="text-4xl opacity-50" aria-hidden>
        {icon}
      </span>
      <h3 className="mt-4 text-base font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      {children}
      {action ? (
        <Link href={action.href} className="btn-primary btn-interactive focus-kb mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
