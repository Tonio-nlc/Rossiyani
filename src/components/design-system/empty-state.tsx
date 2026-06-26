import type { ReactNode } from "react";

import { PrimaryButton } from "./primary-button";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: { label: string; href: string };
  children?: ReactNode;
  /** @deprecated Decorative icons removed from editorial empty states. */
  icon?: string;
};

export function EmptyState({ title, description, action, children, icon: _icon }: EmptyStateProps) {
  return (
    <div className="ds-empty-state animate-fade-up">
      <h3 className="text-lg font-bold text-[var(--v2-heading,#111827)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--v2-body,#64748b)]">{description}</p>
      {children}
      {action ? (
        <div className="mt-6">
          <PrimaryButton href={action.href}>{action.label}</PrimaryButton>
        </div>
      ) : null}
    </div>
  );
}
