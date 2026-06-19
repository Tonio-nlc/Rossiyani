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
    <div className="animate-fade-up pb-8">
      <header className="editorial-page-section space-y-4 pb-0">
        <ExplorerBreadcrumb items={breadcrumb} />
        {title ? (
          <div>
            <h1 className="editorial-lead-title break-russian font-semibold tracking-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="editorial-intro mt-3">{subtitle}</p>
            ) : null}
          </div>
        ) : subtitle ? (
          <p className="editorial-intro">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}
