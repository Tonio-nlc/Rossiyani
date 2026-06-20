import type { ReactNode } from "react";

import { EditorialCard } from "@/components/design-system";

export type ExplorerGridItem = {
  label: string;
  href: string;
  subtitle?: string;
  meta?: string;
  featured?: boolean;
};

type ExplorerEditorialGridProps = {
  items: ExplorerGridItem[];
};

/** Two-column editorial grid — shared by hub, browse, and detail pages. */
export function ExplorerEditorialGrid({ items }: ExplorerEditorialGridProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="library-editorial-grid">
      {items.map((item) => (
        <EditorialCard
          key={`${item.href}-${item.label}`}
          href={item.href}
          title={item.label}
          subtitle={item.subtitle}
          meta={item.meta}
          featured={item.featured}
        />
      ))}
    </div>
  );
}

export function ExplorerEditorialSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="editorial-page-section space-y-4">
      {eyebrow ? <p className="text-eyebrow">{eyebrow}</p> : null}
      {title ? <h2 className="editorial-section-title">{title}</h2> : null}
      {description ? <p className="editorial-intro">{description}</p> : null}
      {children}
    </section>
  );
}
