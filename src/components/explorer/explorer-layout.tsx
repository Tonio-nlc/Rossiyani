import type { ReactNode } from "react";

import { ExplorerBreadcrumb } from "./explorer-breadcrumb";

type ExplorerLayoutProps = {
  breadcrumb: Array<{ label: string; href?: string }>;
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export function ExplorerLayout({ breadcrumb, title, subtitle, children }: ExplorerLayoutProps) {
  return (
    <div className="space-y-8 pb-16 animate-fade-up">
      <header className="space-y-4 border-b border-[var(--border)] pb-6">
        <ExplorerBreadcrumb items={breadcrumb} />
        {title ? (
          <div>
            <h1 className="break-russian font-reader text-[clamp(1.75rem,4vw,2.25rem)] font-semibold tracking-tight text-[var(--foreground)]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{subtitle}</p>
            ) : null}
          </div>
        ) : subtitle ? (
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}
