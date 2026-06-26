import type { ReactNode } from "react";

import { PrimaryButton } from "./primary-button";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
  children?: ReactNode;
  visual?: ReactNode;
  /** @deprecated Decorative icons removed from editorial empty states. */
  icon?: string;
};

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
  children,
  visual,
  icon: _icon,
}: EmptyStateProps) {
  return (
    <div className="ds-empty-state animate-fade-up">
      {visual ? <div className="ds-empty-state__visual">{visual}</div> : null}
      {eyebrow ? <p className="ds-empty-state__eyebrow">{eyebrow}</p> : null}
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
      {action ? (
        <div className="ds-empty-state__action">
          <PrimaryButton href={action.href}>{action.label}</PrimaryButton>
        </div>
      ) : null}
    </div>
  );
}
