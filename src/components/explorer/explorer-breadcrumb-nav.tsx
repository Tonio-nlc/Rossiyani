import Link from "next/link";

type ExplorerBreadcrumbNavProps = {
  items: Array<{ label: string; href?: string }>;
};

export function ExplorerBreadcrumbNav({ items }: ExplorerBreadcrumbNavProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="explorer-word__crumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {item.href ? (
            <Link href={item.href} className="explorer-word__crumb-link focus-kb">
              {item.label}
            </Link>
          ) : (
            <span className="explorer-word__crumb-current">{item.label}</span>
          )}
          {index < items.length - 1 ? (
            <span className="explorer-word__crumb-sep" aria-hidden>
              /
            </span>
          ) : null}
        </span>
      ))}
    </nav>
  );
}
