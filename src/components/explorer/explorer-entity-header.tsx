import Link from "next/link";
import type { ReactNode } from "react";

import { ExplorerBreadcrumbNav } from "./explorer-breadcrumb-nav";

type ExplorerEntityAction = {
  label: string;
  href: string;
};

type ExplorerEntityHeaderProps = {
  breadcrumb?: Array<{ label: string; href?: string }>;
  title: string;
  subtitle?: string | null;
  badges?: ReactNode;
  actions?: ExplorerEntityAction[];
};

export function ExplorerEntityHeader({
  breadcrumb,
  title,
  subtitle,
  badges,
  actions,
}: ExplorerEntityHeaderProps) {
  return (
    <header className="explorer-word__hero">
      {breadcrumb && breadcrumb.length > 0 ? (
        <ExplorerBreadcrumbNav items={breadcrumb} />
      ) : null}

      <div className="explorer-word__headline">
        <h1 className="explorer-word__lemma break-russian">{title}</h1>
        {subtitle ? <p className="explorer-word__transcription">{subtitle}</p> : null}
      </div>

      {badges ? <div className="explorer-word__badges">{badges}</div> : null}

      {actions && actions.length > 0 ? (
        <ul className="explorer-word__actions">
          {actions.map((action) => (
            <li key={action.href}>
              <Link href={action.href} className="explorer-word__action focus-kb">
                {action.label} →
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
