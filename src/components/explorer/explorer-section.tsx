import type { ReactNode } from "react";

type ExplorerSectionProps = {
  title: string;
  children: ReactNode;
  id?: string;
};

export function ExplorerSection({ title, children, id }: ExplorerSectionProps) {
  return (
    <section id={id} className="explorer-word-section">
      <h2 className="explorer-word-section__title">{title}</h2>
      {children}
    </section>
  );
}
