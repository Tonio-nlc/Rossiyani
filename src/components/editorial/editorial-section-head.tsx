import type { ReactNode } from "react";

type EditorialSectionHeadProps = {
  id?: string;
  icon: ReactNode;
  title: string;
  lead?: string;
};

export function EditorialSectionHead({ id, icon, title, lead }: EditorialSectionHeadProps) {
  return (
    <div className="editorial-section-head">
      <span className="editorial-section-head__icon-wrap" aria-hidden>
        {icon}
      </span>
      <div className="editorial-section-head__body">
        <h2 id={id} className="editorial-section-head__title">
          {title}
        </h2>
        {lead ? <p className="editorial-section-head__lead">{lead}</p> : null}
      </div>
    </div>
  );
}
