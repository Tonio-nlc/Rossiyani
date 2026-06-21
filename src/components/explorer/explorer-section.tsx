import type { ReactNode } from "react";

import { ExplorerSectionIcon, type ExplorerSectionIconId } from "./explorer-section-icons";

type ExplorerSectionProps = {
  title: string;
  icon?: ExplorerSectionIconId;
  lead?: string;
  children: ReactNode;
  id?: string;
};

export function ExplorerSection({ title, icon, lead, children, id }: ExplorerSectionProps) {
  return (
    <section id={id} className="explorer-word-section">
      <header className="explorer-word-section__header">
        <h2 className="explorer-word-section__title">
          {icon ? <ExplorerSectionIcon id={icon} /> : null}
          <span>{title}</span>
        </h2>
        {lead ? <p className="explorer-word-section__lead">{lead}</p> : null}
      </header>
      <div className="explorer-word-section__content">{children}</div>
    </section>
  );
}
