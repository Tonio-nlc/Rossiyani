import Link from "next/link";

export type KnowledgeChainItem = {
  label: string;
  href?: string;
};

type KnowledgeChainProps = {
  items: KnowledgeChainItem[];
  className?: string;
};

export function KnowledgeChain({ items, className = "" }: KnowledgeChainProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={["flex flex-wrap items-center gap-x-2 gap-y-1", className].filter(Boolean).join(" ")}>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 ? (
            <span className="text-[var(--ink-muted)]" aria-hidden>
              ↓
            </span>
          ) : null}
          {item.href ? (
            <Link
              href={item.href}
              className="focus-kb font-reader text-base text-[var(--ink)] link-editorial no-underline hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-reader text-base text-[var(--ink)]">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
