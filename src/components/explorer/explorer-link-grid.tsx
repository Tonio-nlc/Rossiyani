import Link from "next/link";

import type { ExplorerHubLink } from "./explorer-hub-links";

type ExplorerLinkGridProps = {
  title: string;
  icon: string;
  links: ExplorerHubLink[];
};

export function ExplorerLinkGrid({ title, icon, links }: ExplorerLinkGridProps) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
        <span aria-hidden>{icon}</span>
        {title}
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="focus-kb card-hover flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]"
            >
              <span className="font-medium text-[var(--foreground)]">{link.label}</span>
              {link.description ? (
                <span className="mt-0.5 text-xs text-[var(--muted)]">{link.description}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
