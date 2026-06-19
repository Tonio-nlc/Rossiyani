import Link from "next/link";
import type { ReactNode } from "react";

type EditorialCardProps = {
  href: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  footer?: ReactNode;
  featured?: boolean;
};

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
    <article className={featured ? "ds-editorial-card ds-editorial-card-featured" : "ds-editorial-card"}>
      <Link href={href} prefetch className="focus-kb ds-editorial-card-link">
        {eyebrow ? <p className="text-eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="font-reader text-[var(--ink)] leading-snug break-russian">{title}</h2>
        {subtitle ? (
          <p className="mt-2 font-reader text-sm text-[var(--ink-secondary)]">{subtitle}</p>
        ) : null}
        {meta ? <p className="mt-3 text-metadata">{meta}</p> : null}
        {footer ? <div className="mt-4 border-t border-[var(--hairline)] pt-4">{footer}</div> : null}
      </Link>
    </article>
  );
}
