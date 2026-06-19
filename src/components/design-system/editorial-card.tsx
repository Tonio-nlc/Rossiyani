import Link from "next/link";
import type { ReactNode } from "react";

type EditorialCardProps = {
  href?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  footer?: ReactNode;
  featured?: boolean;
};

function CardShell({
  featured,
  href,
  children,
}: {
  featured: boolean;
  href?: string;
  children: ReactNode;
}) {
  const className = featured ? "ds-editorial-card ds-editorial-card-featured" : "ds-editorial-card";

  if (href) {
    return (
      <article className={className}>
        <Link href={href} prefetch className="focus-kb ds-editorial-card-link">
          {children}
        </Link>
      </article>
    );
  }

  return <article className={className}><div className="ds-editorial-card-link">{children}</div></article>;
}

export function EditorialCard({
  href,
  eyebrow,
  title,
  subtitle,
  meta,
  footer,
  featured = false,
}: EditorialCardProps) {
  return (
    <CardShell featured={featured} href={href}>
      {eyebrow ? <p className="text-eyebrow mb-2">{eyebrow}</p> : null}
      <h2 className="font-reader text-[var(--ink)] leading-snug break-russian">{title}</h2>
      {subtitle ? (
        <p className="mt-2 font-reader text-sm text-[var(--ink-secondary)]">{subtitle}</p>
      ) : null}
      {meta ? <p className="mt-3 text-metadata">{meta}</p> : null}
      {footer ? <div className="mt-4 border-t border-[var(--hairline)] pt-4">{footer}</div> : null}
    </CardShell>
  );
}
