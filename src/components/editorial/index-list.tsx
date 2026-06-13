import Link from "next/link";

type IndexListProps = {
  items: Array<{ label: string; href: string; meta?: string }>;
  className?: string;
  dense?: boolean;
};

/** Editorial index — lists over cards. */
export function IndexList({ items, className = "", dense = false }: IndexListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={["divide-y divide-[var(--hairline)]", className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={[
              "focus-kb group flex items-baseline justify-between gap-4 transition hover:opacity-80",
              dense ? "py-1.5" : "py-3",
            ].join(" ")}
          >
            <span
              className={[
                "font-reader text-[var(--ink)] group-hover:text-[var(--color-link)]",
                dense ? "text-sm" : "text-base",
              ].join(" ")}
            >
              {item.label}
            </span>
            {item.meta ? (
              <span className="shrink-0 text-metadata">{item.meta}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
