import Link from "next/link";

export type ExplorerCompactItem = {
  label: string;
  href: string;
  meta?: string;
  subtitle?: string;
};

type ExplorerCompactListProps = {
  title?: string;
  items: ExplorerCompactItem[];
};

export function ExplorerCompactList({ title, items }: ExplorerCompactListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="explorer-compact-block">
      {title ? <h2 className="explorer-compact-block__title">{title}</h2> : null}
      <ul className="explorer-compact-list">
        {items.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <Link href={item.href} className="explorer-compact-row focus-kb">
              <span className="explorer-compact-row__main">
                <span className="explorer-compact-row__label break-russian">{item.label}</span>
                {item.subtitle ? (
                  <span className="explorer-compact-row__subtitle">{item.subtitle}</span>
                ) : null}
              </span>
              {item.meta ? <span className="explorer-compact-row__meta">{item.meta}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
